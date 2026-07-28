package com.example.backend.dashboard.service;

import com.example.backend.budget.entity.Budget;
import com.example.backend.budget.repository.BudgetRepository;
import com.example.backend.dashboard.dto.DashboardResponse;
import com.example.backend.expense.entity.Expense;
import com.example.backend.expense.entity.ExpenseStatus;
import com.example.backend.expense.repository.ExpenseRepository;
import com.example.backend.member.entity.User;
import com.example.backend.member.exception.MemberErrorCode;
import com.example.backend.member.exception.MemberException;
import com.example.backend.member.repository.UserRepository;
//import com.example.backend.teamMember.entity.TeamStatus;
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

        Long usedBudget = budget.getUsedBudget();
        Long remainingBudget = budget.getRemainingBudget();
        Long totalBudget = usedBudget + remainingBudget;
        int usagePercentage = totalBudget == 0 ? 0 : (int) ((usedBudget * 100) / totalBudget);

        // 5. 모임 인원 수 (ACCEPTED 멤버)
        long memberCount = teamMemberRepository.countByTeamIdAndStatus(teamId,"ACCEPTED");

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
                        .status(expense.getStatus().name())
                        .date(expense.getCreatedAt().toString())
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
}