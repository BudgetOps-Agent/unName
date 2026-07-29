package com.example.backend.expense.service;

import com.example.backend.budget.entity.Budget;
import com.example.backend.budget.repository.BudgetRepository;
import com.example.backend.expense.dto.*;
import com.example.backend.expense.entity.*;
import com.example.backend.expense.exception.ExpenseErrorCode;
import com.example.backend.expense.exception.ExpenseException;
import com.example.backend.expense.repository.ExpenseRepository;
import com.example.backend.expense.repository.ExpensesReviewRepository;
import com.example.backend.member.repository.UserRepository;
import com.example.backend.teamMember.entity.TeamMember;
import com.example.backend.teamMember.entity.TeamRole;
import com.example.backend.teamMember.repository.TeamMemberRepository;
import com.example.backend.member.entity.User;
import com.example.backend.member.exception.MemberErrorCode;
import com.example.backend.member.exception.MemberException;
import com.example.backend.teamMember.exception.TeamMemberErrorCode;
import com.example.backend.teamMember.exception.TeamMemberException;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.global.file.FileStorageService;
import com.example.backend.team.entity.Team;
import com.example.backend.team.repository.TeamRepository;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service // 이 클래스가 비즈니스 로직 담당이라는 표시, Spring이 자동으로 Bean 등록
@RequiredArgsConstructor // final 필드들 받는 생성자를 Lombok이 자동으로 만들어줌 (직접 안 써도 됨)
public class ExpenseService {

    // Repository 주입 (final로 선언 → @RequiredArgsConstructor가 알아서 생성자 에 넣어줌)
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    // 지출 등록 (API-016)
    private final FileStorageService fileStorageService; // 영수증 파일 저장 담당 부품
    private final TeamRepository teamRepository;          // 지출 등록 시 팀 존재 확인 + Team 객체 조회용

    // 지출 반려(API-020)
    private final ExpensesReviewRepository expensesReviewRepository;

    // 지출 목록 조회 (API-014)
    //
    // status=null 또는 "ALL"이면 전체 조회
    // status="SUBMITTED"면 대기(SUBMITTED+ESCALATED 둘 다 조회)
    // status="APPROVED"/"REJECTED"면 해당 상태만 단독 조회
    // @Transactional(readOnly = true)를 쓰는 이유
    // 아래에서 expense.getUser().getName() 을 부르는데
    // User 필드가 LAZY 로딩이라 이걸 부르는 시점에 DB 세션이 살아있어야 함
    // 안 붙이면 예전에 겪었던 LazyInitializationException에러 다시 만날 수 있음
    // 지금 이 데이터를 가져오려는데, DB 연결(세션)이 이미 끊겨서 못 가져옵니다~ 하는 에러
    // 프론트가 status 값 하나를 보내면, 그 값에 맞는 지출들을 조회해서 응답 만들어 돌려주는 메서드
    @Transactional(readOnly = true)
    public ExpenseListResponse getExpenses(Long teamId, String status) {

        // 1. 요청받은 status에 따라 실제로 조회할 상태 리스트를 결정
        List<ExpenseStatus> statusFilter = resolveStatusFilter(status);

        // 2. 그 조건으로 지출 목록 조회
        List<Expense> expenses = expenseRepository.findByTeamIdAndStatusIn(teamId, statusFilter);

        // 3. Expense 엔티티 → ExpenseInfo(DTO)로 변환
        List<ExpenseListResponse.ExpenseInfo> expenseInfos = expenses.stream()
                .map(ExpenseListResponse.ExpenseInfo::fromEntity)
                .collect(Collectors.toList());

        // 4. 탭에 표시할 상태별 개수 계산
        ExpenseListResponse.Counts counts = ExpenseListResponse.Counts.builder()
                .all(expenseRepository.countByTeamIdAndStatusIn(teamId,
                        List.of(ExpenseStatus.SUBMITTED, ExpenseStatus.ESCALATED,
                                ExpenseStatus.APPROVED, ExpenseStatus.REJECTED)))
                .pending(expenseRepository.countByTeamIdAndStatusIn(teamId,
                        List.of(ExpenseStatus.SUBMITTED, ExpenseStatus.ESCALATED)))
                .approved(expenseRepository.countByTeamIdAndStatusIn(teamId,
                        List.of(ExpenseStatus.APPROVED)))
                .rejected(expenseRepository.countByTeamIdAndStatusIn(teamId,
                        List.of(ExpenseStatus.REJECTED)))
                .build();

        // 5. 응답 반환
        return ExpenseListResponse.builder()
                .success(true)
                .counts(counts)
                .expenses(expenseInfos)
                .build();
    }

    // status 파라미터 값에 따라 실제 조회할 상태 리스트를 정하는 메서드
    // 프론트는 여전히 문자열("SUBMITTED" 등)로 보내므로, 여기서 Enum으로 변환해줌
    private List<ExpenseStatus> resolveStatusFilter(String status) {
        if (status == null || status.equals("ALL")) {
            return List.of(ExpenseStatus.SUBMITTED, ExpenseStatus.ESCALATED,
                    ExpenseStatus.APPROVED, ExpenseStatus.REJECTED); // 전체
        } else if (status.equals("SUBMITTED")) {
            return List.of(ExpenseStatus.SUBMITTED, ExpenseStatus.ESCALATED); // 대기 탭
        } else {
            // 문자열을 Enum으로 변환 (잘못된 값이 오면 예외 발생)
            return List.of(ExpenseStatus.valueOf(status)); // APPROVED 또는 REJECTED 단독
        }
    }
    // 정산 리포트 조회 (API-050)
// 승인된 지출 내역 + 예산 현황을 한 번에 조회
    @Transactional(readOnly = true)
    public ReportResponse getReport(Long teamId) {

        // 1. 토큰에서 로그인한 사람 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 요청자 조회
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. 요청자가 이 모임 소속인지 확인 (남의 모임 정산 못 보게 막음)
        teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        // 4. 승인된 지출 목록 조회 (승인일 최신순)
        List<Expense> approvedExpenses =
                expenseRepository.findByTeamIdAndStatusOrderByApprovedAtDesc(teamId, ExpenseStatus.APPROVED);

        // 5. 총 지출 합계 계산
        Long totalExpense = approvedExpenses.stream()
                .mapToLong(Expense::getAmount)
                .sum();

        // 6. 예산 정보 조회
        Budget budget = budgetRepository.findByTeamId(teamId)
                .orElseThrow(() -> new RuntimeException("예산 정보를 찾을 수 없습니다."));

        Long totalBudget = budget.getTotalBudget();
        Long usedBudget = budget.getUsedBudget();
        Long remainingBudget = totalBudget - usedBudget;

        // 총 예산이 0이면 나누기 에러(ArithmeticException) 나니까 0으로 처리
        int usagePercentage = totalBudget == 0 ? 0 : (int) ((usedBudget * 100) / totalBudget);

        // 7. Expense → ExpenseInfo(DTO)로 변환
        List<ReportResponse.ExpenseInfo> expenseInfos = approvedExpenses.stream()
                .map(expense -> ReportResponse.ExpenseInfo.builder()
                        .id(expense.getId())
                        .title(expense.getTitle())
                        .category(expense.getCategory().name())   // Enum → String
                        .requesterName(expense.getUser().getName())
                        .date(expense.getApprovedAt() == null ? null : expense.getApprovedAt().toString())
                        .amount(expense.getAmount())
                        .build())
                .collect(Collectors.toList());

        // 8. 응답 반환
        return ReportResponse.builder()
                .success(true)
                .report(ReportResponse.ReportInfo.builder()
                        .totalExpense(totalExpense)
                        .approvedCount(approvedExpenses.size())
                        .totalBudget(totalBudget)
                        .usedBudget(usedBudget)
                        .remainingBudget(remainingBudget)
                        .usagePercentage(usagePercentage)
                        .expenses(expenseInfos)
                        .build())
                .build();
    }

    // 지출 등록 (API-016)
    // 팀원이 지출을 등록. 영수증 파일 저장 후 Expense 생성해서 DB에 저장.
    // @Transactional(readOnly 없음)을 쓰는 이유: save 하는 "쓰기" 작업이라
    // 중간에 문제 생기면 저장한 것도 롤백돼서 데이터가 반쪽만 남는 걸 막음
    @Transactional
    public ExpenseCreateResponse createExpense(Long teamId,
                                               ExpenseCreateRequest request,
                                               MultipartFile receiptFile) {

        // 1. 토큰에서 로그인한 사람 이메일 꺼내기 (getReport랑 동일한 방식)
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 요청자(작성자) 조회 (없으면 404)
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. 요청자가 이 모임 소속인지 확인 (아니면 403) — 남의 팀에 지출 못 넣게 막음
        teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        // 4. 팀이 실제로 존재하는지 확인 + Expense에 넣을 Team 객체 조회 (없으면 404)
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.TEAM_NOT_FOUND));

        // 5. 영수증 파일 저장 → DB(receiptUrl)에 넣을 경로 받음
        //    통과 조건(멤버·팀)을 먼저 다 확인한 뒤 "마지막에" 저장하는 이유:
        //    앞에서 걸리면(403/404) 파일이 uploads 폴더에 쓰레기로 안 남게 하려고
        //    파일 없음/형식 오류/용량 초과 검증은 FileStorageService가 내부에서 처리
        String receiptUrl = fileStorageService.store(receiptFile);

        // 6. Expense 객체 생성 (@Builder — status=SUBMITTED, version=0, createdAt 등은 자동 세팅됨)
        Expense expense = Expense.builder()
                .team(team)
                .user(requester)
                .title(request.getTitle())
                .category(request.getCategory())
                .amount(request.getAmount())
                .description(request.getDescription())
                .receiptUrl(receiptUrl)
                .build();

        // API-029(팀 설정) 연동 후 autoApprove/autoApproveLimit 값에 따라
        // status를 SUBMITTED / ESCALATED / APPROVED로 자동 결정하는 로직 추가
        // 지금은 엔티티 기본값(SUBMITTED)으로 등록됨

        // 7. DB에 저장
        Expense saved = expenseRepository.save(expense);

        // 8. 저장된 Expense → 응답 DTO로 변환해서 return
        return ExpenseCreateResponse.fromEntity(saved);
    }

    // 지출 상세 조회 (API-017)
    // 지출 한 건의 상세 정보를 조회. 작성자 이름(LAZY)을 꺼내니까 @Transactional(readOnly) 필요
    @Transactional(readOnly = true)
    public ExpenseDetailResponse getExpenseDetail(Long expenseId) {

        // 1. 지출 조회 (없으면 404)
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseException(ExpenseErrorCode.EXPENSE_NOT_FOUND));

        // 2. 엔티티 → 상세 응답 DTO로 변환해서 반환
        //    (receiptUrl → receiptFileUrl 변환, 요청자 이름 등은 fromEntity 안에서 처리)
        return ExpenseDetailResponse.fromEntity(expense);
    }

    // 지출 반려 (API-020)
    // 관리자/총무가 지출을 반려. expenses + expenses_reviews 두 테이블을 한 트랜잭션으로 처리
    @Transactional
    public ExpenseRejectResponse rejectExpense(Long expenseId, ExpenseRejectRequest request) {

        // 1. 로그인한 사람 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 요청자 조회 (없으면 404)
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. 반려할 지출 조회 (없으면 404)
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseException(ExpenseErrorCode.EXPENSE_NOT_FOUND));

        // 4. 요청자가 이 지출의 팀에서 승인/반려 권한이 있는지 확인 (ADMIN 또는 ACCOUNTANT)
        Long teamId = expense.getTeam().getId();
        TeamMember teamMember = teamMemberRepository
                .findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        TeamRole role = teamMember.getRole();
        if (role != TeamRole.ADMIN && role != TeamRole.ACCOUNTANT) {
            throw new ExpenseException(ExpenseErrorCode.NOT_AUTHORIZED_TO_APPROVE);
        }

        // 5. 이미 처리된 건(APPROVED/REJECTED)이면 막기
        if (expense.getStatus() == ExpenseStatus.APPROVED
                || expense.getStatus() == ExpenseStatus.REJECTED) {
            throw new ExpenseException(ExpenseErrorCode.ALREADY_PROCESSED);
        }

        // 6. 반려 처리 (엔티티의 reject 메서드 호출 → status/사유/처리자/시각 한번에 변경)
        expense.reject(requester, request.getRejectReason());

        // 7. expenses_reviews에 심사 결과 기록 (사람이 반려했다는 기록)
        ExpensesReview review = ExpensesReview.builder()
                .expense(expense)
                .finalVerdict(FinalVerdict.REJECTED)
                .detail("{\"reason\": \"" + request.getRejectReason() + "\"}") // 반려사유를 json으로
                .suggestedCategory(null)          // 사람 처리라 AI 추천 카테고리 없음
                .processedBy(ProcessedBy.HUMAN)   // 사람이 처리
                .build();
        expensesReviewRepository.save(review);

        //      LLM팀에게 반려 사유 전달 (URL 확정 후)
        //       @TransactionalEventListener(AFTER_COMMIT)로 커밋 성공 후 비동기 전송 예정

        // 8. 응답 반환
        return ExpenseRejectResponse.fromEntity(expense);
    }

    // 지출 승인 (API-019)
    // 관리자/총무가 지출을 승인. expenses + budgets + expenses_reviews 세 테이블을 한 트랜잭션으로 처리
    // 승인 시 예산(usedBudget)에 지출 금액이 반영되므로, 반려(020)보다 예산 처리가 추가됨
    @Transactional
    public ExpenseApproveResponse approveExpense(Long expenseId) {

        // 1. 로그인한 사람 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 요청자 조회 (없으면 404)
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. 승인할 지출 조회 (없으면 404)
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseException(ExpenseErrorCode.EXPENSE_NOT_FOUND));

        // 4. 요청자가 이 지출의 팀에서 승인 권한이 있는지 확인 (ADMIN 또는 ACCOUNTANT)
        Long teamId = expense.getTeam().getId();
        TeamMember teamMember = teamMemberRepository
                .findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        TeamRole role = teamMember.getRole();
        if (role != TeamRole.ADMIN && role != TeamRole.ACCOUNTANT) {
            throw new ExpenseException(ExpenseErrorCode.NOT_AUTHORIZED_TO_APPROVE);
        }

        // 5. 이미 처리된 건(APPROVED/REJECTED)이면 막기
        if (expense.getStatus() == ExpenseStatus.APPROVED
                || expense.getStatus() == ExpenseStatus.REJECTED) {
            throw new ExpenseException(ExpenseErrorCode.ALREADY_PROCESSED);
        }

        // 6. 예산 조회 (팀당 1개)
        Budget budget = budgetRepository.findByTeamId(teamId)
                .orElseThrow(() -> new RuntimeException("예산 정보를 찾을 수 없습니다."));

        // 7. 예산 부족 체크 — 남은 예산(total-used)보다 지출 금액이 크면 승인 거부
        long remaining = budget.getTotalBudget() - budget.getUsedBudget();
        if (expense.getAmount() > remaining) {
            throw new ExpenseException(ExpenseErrorCode.BUDGET_EXCEEDED);
        }

        // 8. 승인 처리 (상태/처리자/시각 변경)
        expense.approve(requester);

        // 9. 예산 차감 (used_budget에 지출 금액 더하기)
        budget.addUsedBudget(expense.getAmount());

        // 10. expenses_reviews에 심사 결과 기록 (사람이 승인했다는 기록)
        ExpensesReview review = ExpensesReview.builder()
                .expense(expense)
                .finalVerdict(FinalVerdict.APPROVED)
                .detail(null)                     // 승인은 별도 사유 없음 (필요시 나중에 채움)
                .suggestedCategory(null)
                .processedBy(ProcessedBy.HUMAN)
                .build();
        expensesReviewRepository.save(review);

        // 11. 응답 반환
        return ExpenseApproveResponse.fromEntity(expense);
    }
}