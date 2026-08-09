package com.example.backend.dashboard.service;

import com.example.backend.budget.entity.Budget;
import com.example.backend.budget.repository.BudgetRepository;
import com.example.backend.dashboard.dto.AiSummaryResponse;
import com.example.backend.dashboard.dto.DashboardResponse;
import com.example.backend.global.llm.LlmClient;
import com.example.backend.global.llm.dto.DashboardSummaryRequest;
import com.example.backend.global.llm.dto.DashboardSummaryResponse;
import com.example.backend.expense.entity.Expense;
import com.example.backend.expense.entity.ExpenseStatus;
import com.example.backend.expense.repository.ExpenseRepository;
import com.example.backend.member.entity.User;
import com.example.backend.member.exception.MemberErrorCode;
import com.example.backend.member.exception.MemberException;
import com.example.backend.member.repository.UserRepository;
//import com.example.backend.teamMember.entity.TeamStatus;
import com.example.backend.teamMember.entity.TeamStatus;
import com.example.backend.teamMember.exception.TeamMemberErrorCode;
import com.example.backend.teamMember.exception.TeamMemberException;
import com.example.backend.teamMember.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final LlmClient llmClient; // AI 대시보드 요약(API-024, LLM-017) 호출용

    // 대시보드 조회 (API-023)
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long teamId) {

        // 1. 로그인한 사람 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 요청자 조회
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. 이 모임 소속인지 확인
        teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        // 4. 예산 정보
        Budget budget = budgetRepository.findByTeamId(teamId)
                .orElseThrow(() -> new RuntimeException("예산 정보를 찾을 수 없습니다."));

        Long totalBudget = budget.getTotalBudget();
        Long usedBudget = budget.getUsedBudget();
        Long remainingBudget = totalBudget - usedBudget;

        int usagePercentage =
                totalBudget == 0 ? 0 : (int) ((usedBudget * 100) / totalBudget);

        // 5. 모임 인원 수 (ACCEPTED 멤버)
        long memberCount = teamMemberRepository.countByTeamIdAndStatus(teamId, TeamStatus.ACCEPTED);

        // 6. 승인 대기 건수 (SUBMITTED + ESCALATED)
        List<ExpenseStatus> pendingStatuses = List.of(ExpenseStatus.SUBMITTED, ExpenseStatus.ESCALATED);
        long pendingApprovalCount = expenseRepository.countByTeamIdAndStatusIn(teamId, pendingStatuses);

        // 7. 승인 대기 미리보기 (최신순 2개)
        Pageable top2 = PageRequest.of(0, 2); // 0페이지, 2개
        List<Expense> pendingExpenses =
                expenseRepository.findByTeamIdAndStatusInOrderByCreatedAtDesc(teamId, pendingStatuses, top2);

        // 8. 승인 대기 금액 합계 (미리보기 2개가 아니라 전체 대기 금액)
        List<Expense> allPending = expenseRepository.findByTeamIdAndStatusIn(teamId, pendingStatuses);
        Long pendingAmount = allPending.stream()
                .mapToLong(Expense::getAmount)
                .sum();

        // 9. 미리보기 지출 → DTO 변환
        List<DashboardResponse.ExpenseInfo> recentExpenses = pendingExpenses.stream()
                .map(expense -> DashboardResponse.ExpenseInfo.builder()
                        .id(expense.getId())
                        .title(expense.getTitle())
                        .amount(expense.getAmount())
                        .status(expense.getStatus())
                        .requesterName(expense.getUser().getName())
                        .date(expense.getExpenseDate().toString())
                        .build())
                .collect(Collectors.toList());

        // 10. 응답 반환
        return DashboardResponse.builder()
                .success(true)
                .dashboard(DashboardResponse.DashboardInfo.builder()
                        .totalBudget(totalBudget)
                        .usedBudget(usedBudget)
                        .remainingBudget(remainingBudget)
                        .usagePercentage(usagePercentage)
                        .memberCount(memberCount)
                        .pendingApprovalCount(pendingApprovalCount)
                        .pendingAmount(pendingAmount)
                        .recentExpenses(recentExpenses)
                        .build())
                .build();
    }

    // AI 대시보드 요약 (API-024)
    // 메인 대시보드 "AI 요약" 카드용 — LLM-017(/v1/dashboard/summary)을 동기 호출해서 문구를 받아옴
    // 대시보드 본체(API-023)와 별개 호출이라, 요약이 실패(502)해도 대시보드 자체는 정상 동작함
    @Transactional(readOnly = true)
    public AiSummaryResponse getAiSummary(Long teamId) {

        // 1. 요청자 조회 + 이 모임 소속인지 확인 (대시보드 조회와 동일한 접근 제어)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));
        teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        // 2. LLM-017 호출 (period 미전송 → LLM이 당월로 처리)
        DashboardSummaryRequest request = DashboardSummaryRequest.builder()
                .teamId(teamId)
                .build();
        DashboardSummaryResponse llmResponse = llmClient.dashboardSummary(request);

        // 3. 프론트가 쓸 형태로 변환 (message → summary, verified 그대로 전달)
        return AiSummaryResponse.builder()
                .success(true)
                .summary(llmResponse == null ? null : llmResponse.getMessage())
                .verified(llmResponse == null ? null : llmResponse.getVerified())
                .build();
    }
}