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
import com.example.backend.notification.repository.NotificationRepository;
import com.example.backend.notification.service.NotificationService;
import com.example.backend.teamMember.entity.TeamMember;
import com.example.backend.teamMember.entity.TeamRole;
import com.example.backend.teamMember.repository.TeamMemberRepository;
import com.example.backend.member.entity.User;
import com.example.backend.member.exception.MemberErrorCode;
import com.example.backend.member.exception.MemberException;
import com.example.backend.teamMember.exception.TeamMemberErrorCode;
import com.example.backend.teamMember.exception.TeamMemberException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.global.file.FileStorageService;
import com.example.backend.global.llm.LlmClient;
import com.example.backend.global.llm.dto.AnalyzeRequest;
import com.example.backend.global.llm.dto.PrecedentRequest;
import com.example.backend.team.entity.Team;
import com.example.backend.team.repository.TeamRepository;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    private final NotificationService notificationService;

    // 지출 삭제(API-021) 시 자식 알림 정리용
    private final NotificationRepository notificationRepository;

    // 승인/반려 결정을 LLM에 판례로 전송(LLM-007)하는 데 사용
    private final LlmClient llmClient;

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

        // 1. 요청자 조회 + 팀 소속/권한 확인
        //    MEMBER는 자기가 요청한 지출만, ADMIN/ACCOUNTANT는 팀 전체를 봄 (프론트 요청, 2026-08-07)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));
        TeamMember teamMember = teamMemberRepository
                .findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));

        // MEMBER면 본인 것만 → 카운트·목록 모두 본인 userId로 거름 (관리자/총무는 null = 전체)
        Long scopeUserId = (teamMember.getRole() == TeamRole.MEMBER) ? requester.getId() : null;

        // 2. 요청받은 status에 따라 실제로 조회할 상태 리스트를 결정
        List<ExpenseStatus> statusFilter = resolveStatusFilter(status);

        // 3. 그 조건으로 지출 목록 조회 (권한에 따라 본인 것만/전체)
        List<Expense> expenses = (scopeUserId == null)
                ? expenseRepository.findByTeamIdAndStatusInOrderByExpenseDateDesc(teamId, statusFilter)
                : expenseRepository.findByTeamIdAndUserIdAndStatusInOrderByExpenseDateDesc(
                        teamId, scopeUserId, statusFilter);

        // 4. Expense 엔티티 → ExpenseInfo(DTO)로 변환
        List<ExpenseListResponse.ExpenseInfo> expenseInfos = expenses.stream()
                .map(ExpenseListResponse.ExpenseInfo::fromEntity)
                .collect(Collectors.toList());

        // 5. 탭에 표시할 상태별 개수 계산 (MEMBER면 본인 것 기준)
        ExpenseListResponse.Counts counts = ExpenseListResponse.Counts.builder()
                .all(countByStatuses(teamId, scopeUserId,
                        List.of(ExpenseStatus.SUBMITTED, ExpenseStatus.ESCALATED,
                                ExpenseStatus.APPROVED, ExpenseStatus.REJECTED)))
                .pending(countByStatuses(teamId, scopeUserId,
                        List.of(ExpenseStatus.SUBMITTED, ExpenseStatus.ESCALATED)))
                .approved(countByStatuses(teamId, scopeUserId,
                        List.of(ExpenseStatus.APPROVED)))
                .rejected(countByStatuses(teamId, scopeUserId,
                        List.of(ExpenseStatus.REJECTED)))
                .build();

        // 6. 응답 반환
        return ExpenseListResponse.builder()
                .success(true)
                .counts(counts)
                .expenses(expenseInfos)
                .build();
    }

    // 상태별 개수 세기 헬퍼
    // scopeUserId == null이면 팀 전체, 값이 있으면 그 사람이 요청한 지출만 카운트
    private long countByStatuses(Long teamId, Long scopeUserId, List<ExpenseStatus> statuses) {
        return (scopeUserId == null)
                ? expenseRepository.countByTeamIdAndStatusIn(teamId, statuses)
                : expenseRepository.countByTeamIdAndUserIdAndStatusIn(teamId, scopeUserId, statuses);
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
    public ReportExpenseListResponse getReport(Long teamId, int page, int size) {
        // 1. 토큰에서 로그인한 사람 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 요청자 조회
        User requester = userRepository.findByEmail(email)
            .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));
        // 관리자·총무만 정산 리포트 조회 가능
        if (teamMember.getRole() != TeamRole.ADMIN && teamMember.getRole() != TeamRole.ACCOUNTANT) {
            throw new ExpenseException(ExpenseErrorCode.NOT_AUTHORIZED_TO_VIEW_REPORT);
        }

        PageRequest pageable = PageRequest.of(page, size);

        Page<Expense> approvedExpenses =
                expenseRepository.findByTeamIdAndStatusOrderByApprovedAtDesc(
                        teamId,
                        ExpenseStatus.APPROVED,
                        pageable
                );

        if (approvedExpenses.isEmpty()) {
            throw new ExpenseException(ExpenseErrorCode.EXPENSE_NOT_FOUND);
        }

        // 7. Expense → ExpenseInfo(DTO)로 변환
        List<ReportExpenseListResponse.ExpenseInfo> expenseInfos =
                approvedExpenses.getContent().stream()
                .map(expense ->
                    ReportExpenseListResponse.ExpenseInfo.builder()
                        .id(expense.getId())
                        .title(expense.getTitle())
                        // 카테고리는 AI 심사 전이면 null이라 그대로 .name() 부르면 터짐
                        .category(expense.getCategory() == null
                                ? null
                                : expense.getCategory().name())
                        .requesterName(expense.getUser().getName())
                        .date(expense.getApprovedAt() == null
                                ? null
                                : expense.getApprovedAt().toString())
                        .amount(expense.getAmount())
                        .build()
                )
                .collect(Collectors.toList());

        // 8. 응답 반환
        return ReportExpenseListResponse.builder()
                .success(true)
                .page(approvedExpenses.getNumber())
                .size(approvedExpenses.getSize())
                .totalElements(approvedExpenses.getTotalElements())
                .totalPages(approvedExpenses.getTotalPages())
                .expenses(expenseInfos)
                .build();
    }

    @Transactional(readOnly = true)
    public ReportSummaryResponse getSummary(Long teamId) {
        // 1. 토큰에서 로그인한 사람 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 요청자 조회
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. 요청자가 이 모임 소속인지 확인 (남의 모임 정산 못 보게 막음) + 관리자·총무만 조회 가능
        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));
        if (teamMember.getRole() != TeamRole.ADMIN && teamMember.getRole() != TeamRole.ACCOUNTANT) {
            throw new ExpenseException(ExpenseErrorCode.NOT_AUTHORIZED_TO_VIEW_REPORT);
        }

        // 4. 승인된 지출 목록 조회 (승인일 최신순)
        List<Expense> approvedExpenses =
                expenseRepository.findByTeamIdAndStatusOrderByApprovedAtDesc(
                        teamId,
                        ExpenseStatus.APPROVED
                );

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

        return ReportSummaryResponse.builder()
                .success(true)
                .totalExpense(totalExpense)
                .approvedCount((long) approvedExpenses.size())
                .totalBudget(totalBudget)
                .usedBudget(usedBudget)
                .remainingBudget(remainingBudget)
                .usagePercentage(usagePercentage)
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
                .expenseDate(request.getExpenseDate())
                .receiptUrl(receiptUrl)
                .build();

        // API-029(팀 설정) 연동 후 autoApprove/autoApproveLimit 값에 따라
        // status를 SUBMITTED / ESCALATED / APPROVED로 자동 결정하는 로직 추가
        // 지금은 엔티티 기본값(SUBMITTED)으로 등록됨

        // 7. DB에 저장
        Expense saved = expenseRepository.save(expense);

        // 승인 요청 알림 생성 (관리자+총무에게, 작성자 제외)
        notificationService.notifyApprovalRequest(saved);

        // 8. LLM에 AI 심사 요청 전송 (LLM-003) — 결과는 나중에 CB-001 콜백으로 옴
        //    실패해도 지출 등록은 그대로 유지 (지출은 SUBMITTED로 남고 로그만 남김)
        dispatchAiReview(saved, receiptUrl);

        // 9. 저장된 Expense → 응답 DTO로 변환해서 return
        return ExpenseCreateResponse.fromEntity(saved);
    }

    // 지출 등록 직후 LLM에 AI 심사를 요청 (LLM-003)
    // 우리가 만든 jobId를 지출에 기록(markAiDispatched)해두고 같은 값을 LLM에 보냄 → 콜백(CB-001) 매칭용
    // llmClient.analyze()는 실패해도 예외를 안 던지므로 등록 흐름을 막지 않음
    private void dispatchAiReview(Expense expense, String receiptUrl) {

        // 콜백 매칭용 작업 ID 생성 후 지출에 기록 (더티 체킹으로 aiJobId/aiDispatchedAt 저장됨)
        String jobId = java.util.UUID.randomUUID().toString();
        expense.markAiDispatched(jobId);

        AnalyzeRequest request = AnalyzeRequest.builder()
                .jobId(jobId)
                .expenseId(expense.getId())
                .organizationId(expense.getTeam().getId())
                .receiptPath(toReceiptPath(receiptUrl)) // LLM이 BE-004로 영수증 가져갈 경로
                .build();

        llmClient.analyze(request);
    }

    // 저장 경로("uploads/xxx.png")를 LLM이 접근할 파일 통로("/api/files/xxx.png")로 변환
    // 상세 조회의 receiptFileUrl과 동일 규칙. 파일이 없으면 null
    private String toReceiptPath(String receiptUrl) {
        if (receiptUrl == null) {
            return null;
        }
        String fileName = receiptUrl.substring(receiptUrl.lastIndexOf("/") + 1);
        return "/api/files/" + fileName;
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

    // ObjectMapper는 주입 대신 자체 생성 — Spring Boot 4의 Jackson 빈 타입(2 vs 3) 불일치로 인한
    // "주입 가능한 빈 없음" 시작 오류를 피하려고 인스턴스를 직접 만든다 (AgentCallbackService와 동일 이유)
    private final ObjectMapper objectMapper = new ObjectMapper();

    // AI 심사 결과 조회 (API-046)
    // 지출 상세 화면의 "AI 심사 결과" 카드(심사관별 소견 4개 + 최종판정 + 처리주체 + 자동분류)에 대응
    // CB-001 콜백으로 저장해둔 expenses_reviews.detail(JSON)을 프론트가 바로 쓸 수 있는 모양으로 변환해서 내려줌
    @Transactional(readOnly = true)
    public ExpenseReviewResultResponse getReviewResult(Long expenseId) {

        // 1. 지출 조회 (없으면 404)
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseException(ExpenseErrorCode.EXPENSE_NOT_FOUND));

        // 2. 이 지출의 가장 최근 AI 심사기록 조회
        //    아직 SUBMITTED(AI 심사가 안 끝남)면 기록이 없을 수 있음 → review:null로 응답
        //    (관리자가 승인/반려해서 HUMAN 기록이 추가로 쌓여도, 심사관별 소견은 항상 AI 기록 기준)
        return expensesReviewRepository
                .findTopByExpenseIdAndProcessedByOrderByCreatedAtDesc(expenseId, ProcessedBy.AI)
                .map(review -> buildReviewResultResponse(expense, review))
                .orElseGet(() -> ExpenseReviewResultResponse.builder()
                        .success(true)
                        .review(null) // 아직 AI 심사 전 — 프론트가 "AI 검토중" 등으로 표시
                        .build());
    }

    // ExpensesReview 엔티티 + detail(JSON 문자열)을 파싱해서 응답 DTO로 조립
    private ExpenseReviewResultResponse buildReviewResultResponse(Expense expense, ExpensesReview review) {

        List<ExpenseReviewResultResponse.Reviewer> reviewers = parseReviewers(review.getDetail());

        // 처리 주체 표시값: 관리자가 최종 승인/반려했으면 그 사람 이름, 아니면 "AI"
        String processor = (expense.getApprovedBy() != null)
                ? expense.getApprovedBy().getName()
                : "AI";

        // 자동처리(AUTO) vs 관리자 확인 필요(ESCALATED) — AI 심사 결과 자체가 에스컬레이션이었는지 기준
        String processType = (review.getFinalVerdict() == FinalVerdict.ESCALATED) ? "ESCALATED" : "AUTO";

        String category = (expense.getCategory() == null) ? "미분류" : expense.getCategory().name();

        ExpenseReviewResultResponse.ReviewInfo info = ExpenseReviewResultResponse.ReviewInfo.builder()
                .reviewers(reviewers)
                .finalVerdict(expense.getStatus().name()) // 현재 지출 상태(관리자 최종 처리 반영된 값)
                .processType(processType)
                .processor(processor)
                .category(category)
                .build();

        return ExpenseReviewResultResponse.builder()
                .success(true)
                .review(info)
                .build();
    }

    // detail(JSON 문자열)에서 opinions[]를 꺼내 프론트용 Reviewer 리스트로 변환
    // opinions 항목 필드는 camelCase(auditor, verdict, summary), 근거는 evidence[] 또는 similar_cases(예외적 snake_case)
    // LLM verdict(pass/warn/fail/error) → 프론트 verdict(PASS/FAIL/HOLD)로 매핑
    private List<ExpenseReviewResultResponse.Reviewer> parseReviewers(String detailJson) {
        List<ExpenseReviewResultResponse.Reviewer> reviewers = new ArrayList<>();
        if (detailJson == null || detailJson.isBlank()) {
            return reviewers;
        }

        try {
            JsonNode root = objectMapper.readTree(detailJson);
            JsonNode opinions = root.path("opinions");
            if (!opinions.isArray()) {
                return reviewers;
            }

            int id = 1;
            for (JsonNode opinion : opinions) {
                String verdict = mapAuditorVerdict(opinion.path("verdict").asText(""));
                String summary = opinion.path("summary").asText("");
                String reason = extractReason(opinion);

                reviewers.add(ExpenseReviewResultResponse.Reviewer.builder()
                        .id(id++)
                        .verdict(verdict)
                        .opinion(summary)
                        .reason(reason)
                        .build());
            }
        } catch (Exception e) {
            // detail이 예상과 다른 형식이어도 화면 자체는 떠야 하므로 조용히 빈 리스트 반환
            return new ArrayList<>();
        }

        return reviewers;
    }

    // 심사관 근거 텍스트 조립: evidence[] 우선, 없으면 similar_cases, 둘 다 없으면 소견 재사용
    private String extractReason(JsonNode opinion) {
        JsonNode evidence = opinion.path("evidence");
        if (evidence.isArray() && !evidence.isEmpty()) {
            List<String> items = new ArrayList<>();
            evidence.forEach(e -> items.add(e.isTextual() ? e.asText() : e.toString()));
            return String.join(", ", items);
        }

        JsonNode similarCases = opinion.path("similar_cases");
        if (similarCases.isArray() && !similarCases.isEmpty()) {
            List<String> items = new ArrayList<>();
            similarCases.forEach(c -> items.add(c.isTextual() ? c.asText() : c.toString()));
            return String.join(", ", items);
        }

        return opinion.path("summary").asText("");
    }

    // LLM 심사관 판정(pass/warn/fail/error) → 프론트 뱃지 값(PASS/FAIL/HOLD)
    private String mapAuditorVerdict(String raw) {
        String v = raw == null ? "" : raw.trim().toLowerCase();
        return switch (v) {
            case "pass" -> "PASS";
            case "fail" -> "FAIL";
            default -> "HOLD"; // warn/error/알 수 없음 → 보류로 안전하게 표시
        };
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

        // 반려 결과 알림 (작성자 + 나머지 승인권자에게)
        notificationService.notifyRejected(expense, requester);

        // 8. 관리자 반려 결정을 LLM에 판례로 전송 (LLM-007) — 실패해도 반려는 그대로 유지
        sendPrecedent(expense, "rejected", request.getRejectReason());

        // 9. 응답 반환
        return ExpenseRejectResponse.fromEntity(expense);
    }

    // 관리자의 승인/반려 결정을 LLM에 판례로 저장 (LLM-007)
    // AI 판정을 뒤집었는지(is_override)까지 계산해서 함께 보냄
    // llmClient.savePrecedent()는 실패해도 예외를 안 던지므로 승인/반려 흐름을 막지 않음
    private void sendPrecedent(Expense expense, String decision, String reason) {

        // AI가 앞서 확정 판정(APPROVED/REJECTED)을 냈는데 관리자가 반대로 결정했으면 override
        // (AI가 ESCALATED로 넘긴 건 원래 관리자가 정하는 흐름이라 override 아님)
        boolean isOverride = expensesReviewRepository
                .findTopByExpenseIdAndProcessedByOrderByCreatedAtDesc(expense.getId(), ProcessedBy.AI)
                .map(aiReview -> {
                    FinalVerdict aiVerdict = aiReview.getFinalVerdict();
                    return (aiVerdict == FinalVerdict.APPROVED && decision.equals("rejected"))
                            || (aiVerdict == FinalVerdict.REJECTED && decision.equals("approved"));
                })
                .orElse(false);

        PrecedentRequest request = PrecedentRequest.builder()
                .teamId(expense.getTeam().getId())
                .expenseId(expense.getId())
                .claim(expense.getTitle())   // 무엇에 대한 판단인지 — 지출 제목
                .decision(decision)
                .reason(reason)
                .isOverride(isOverride)
                .ruleVersion(null)           // 팀당 1개(버전 미사용)
                .build();

        llmClient.savePrecedent(request);
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

        // 승인 결과 알림 (작성자 + 나머지 승인권자에게)
        notificationService.notifyApproved(expense, requester);

        // 11. 관리자 승인 결정을 LLM에 판례로 전송 (LLM-007) — 실패해도 승인은 그대로 유지
        //     승인은 별도 사유가 없어 reason은 관례적으로 "관리자 승인" 표기
        sendPrecedent(expense, "approved", "관리자 승인");

        // 12. 응답 반환
        return ExpenseApproveResponse.fromEntity(expense);
    }

    // 월별 지출 통계 (API-047)
    // 최근 N개월의 승인 지출 합계를 월별로 계산 (대시보드 막대그래프용)
    @Transactional(readOnly = true)
    public MonthlyStatsResponse getMonthlyStats(Long teamId, Integer months) {

        // 0. 이 팀 소속인지 확인 (아니면 403) — teamId만 바꿔 남의 팀 통계 못 보게
        checkTeamMembership(teamId);

        // 1. months 파라미터가 없으면 기본값 5개월
        int monthCount = (months == null) ? 5 : months;

        // 2. "몇 개월 전"부터 조회할지 시작일 계산
        //    오늘이 2026-02-15면, 5개월 전인 2025-10-01부터 조회
        //    withDayOfMonth(1)로 그 달의 1일부터로 맞춤 (그래야 그 달 지출이 안 빠짐)
        LocalDate startDate = LocalDate.now()
                .minusMonths(monthCount - 1)
                .withDayOfMonth(1);

        // 3. Repository에서 월별 합계 조회 (승인된 것만, 시작일 이후)
        List<Object[]> results = expenseRepository.findMonthlyTotals(teamId, ExpenseStatus.APPROVED, startDate);

        // 4. Object[] 결과를 DTO로 변환
        //    result[0] = 연-월 문자열("2025-10"), result[1] = 합계
        //    SUM 결과가 Long이 아닌 다른 숫자 타입으로 올 수 있어서 Number로 받아 변환
        List<MonthlyStatsResponse.MonthlyData> statistics = results.stream()
                .map(result -> MonthlyStatsResponse.MonthlyData.builder()
                        .month((String) result[0])
                        .amount(((Number) result[1]).longValue())
                        .build())
                .collect(Collectors.toList());

        // 5. 응답 반환
        return MonthlyStatsResponse.builder()
                .success(true)
                .statistics(statistics)
                .build();
    }

    // 카테고리별 지출 통계 (API-048)
    // 예산 관리 화면 도넛차트용 — "이번 달"에 승인된 지출을 카테고리별로 합산
    //
    // 기준: 승인일(approvedAt)이 이번 달 안에 든 것만 (막대그래프는 지출발생일 기준이라 서로 다른 차트)
    // 분류(category) 없는 지출은 쿼리에서 제외 (AI 심사 전이라 도넛 조각으로 넣을 게 없음)
    @Transactional(readOnly = true)
    public CategoryStatsResponse getCategoryStats(Long teamId) {

        // 0. 이 팀 소속인지 확인 (아니면 403) — teamId만 바꿔 남의 팀 통계 못 보게
        checkTeamMembership(teamId);

        // 1. 이번 달 범위 계산 (이번 달 1일 00:00 ~ 다음 달 1일 00:00 직전)
        //    approvedAt이 LocalDateTime이라 [start, end) 반열린 구간으로 걸러야 경계가 깔끔함
        LocalDateTime start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1);

        // 2. Repository에서 카테고리별 합계 조회 (승인된 것만, 이번 달 승인분)
        List<Object[]> results = expenseRepository.findCategoryTotals(
                teamId, ExpenseStatus.APPROVED, start, end);

        // 3. Object[] 결과를 DTO로 변환
        //    result[0] = ExpenseCategory enum, result[1] = 합계(Number로 받아 Long 변환)
        List<CategoryStatsResponse.CategoryData> statistics = results.stream()
                .map(result -> CategoryStatsResponse.CategoryData.builder()
                        .category(((ExpenseCategory) result[0]).name())
                        .amount(((Number) result[1]).longValue())
                        .build())
                .collect(Collectors.toList());

        // 4. 응답 반환
        return CategoryStatsResponse.builder()
                .success(true)
                .statistics(statistics)
                .build();
    }

    // 이 팀 소속인지 확인하는 공통 부분 (통계·CSV 등 조회에서 재사용)
    // 소속이 아니면 403 — teamId만 바꿔서 남의 팀 데이터 못 보게 막음
    private void checkTeamMembership(Long teamId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));
        teamMemberRepository.findByTeamIdAndUserId(teamId, requester.getId())
                .orElseThrow(() -> new TeamMemberException(TeamMemberErrorCode.NOT_TEAM_MEMBER));
    }

    // 지출 수정 (API-018)
    // 작성자 본인이, 승인 대기(SUBMITTED/ESCALATED) 상태인 자기 지출만 수정 가능
    // 영수증 파일을 새로 올리면 교체하고, 안 올리면 기존 영수증을 그대로 둠
    @Transactional
    public ExpenseUpdateResponse updateExpense(Long expenseId, ExpenseUpdateRequest request,
                                               MultipartFile receiptFile) {

        // 1. 로그인한 사람 이메일 → 요청자 조회 (없으면 404)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 2. 수정할 지출 조회 (없으면 404)
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseException(ExpenseErrorCode.EXPENSE_NOT_FOUND));

        // 3. 작성자 본인인지 확인 (아니면 403)
        if (!expense.getUser().getId().equals(requester.getId())) {
            throw new ExpenseException(ExpenseErrorCode.NOT_EXPENSE_OWNER);
        }

        // 4. 승인 대기 상태만 수정 가능 (승인·반려로 처리 끝난 건 불가)
        if (!isPending(expense)) {
            throw new ExpenseException(ExpenseErrorCode.CANNOT_MODIFY_NOT_PENDING);
        }

        // 5. 영수증: 새로 올렸으면 저장해서 새 경로, 안 올렸으면 기존 경로 유지
        String receiptUrl = (receiptFile != null && !receiptFile.isEmpty())
                ? fileStorageService.store(receiptFile)
                : expense.getReceiptUrl();

        // 6. 값 변경 (카테고리는 AI가 채우는 값이라 제외) — 더티 체킹으로 자동 UPDATE
        expense.update(request.getTitle(), request.getAmount(),
                request.getDescription(), receiptUrl);

        // 7. 응답 반환
        return ExpenseUpdateResponse.fromEntity(expense);
    }

    // 지출 삭제 (API-021)
    // 작성자 본인이, 승인 대기(SUBMITTED/ESCALATED) 상태인 자기 지출만 DB에서 완전 삭제(hard delete)
    // 자식 테이블(알림·심사기록)이 지출을 FK로 참조하므로 먼저 지우고 지출을 삭제함
    @Transactional
    public ExpenseDeleteResponse deleteExpense(Long expenseId) {

        // 1. 로그인한 사람 이메일 → 요청자 조회 (없으면 404)
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 2. 삭제할 지출 조회 (없으면 404)
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ExpenseException(ExpenseErrorCode.EXPENSE_NOT_FOUND));

        // 3. 작성자 본인 또는 관리자만 삭제 가능 (명세 API-021)
        //    본인이 아니면, 이 지출이 속한 팀의 ADMIN인지 확인 (아니면 403)
        boolean isOwner = expense.getUser().getId().equals(requester.getId());
        if (!isOwner) {
            TeamMember teamMember = teamMemberRepository
                    .findByTeamIdAndUserId(expense.getTeam().getId(), requester.getId())
                    .orElseThrow(() -> new ExpenseException(ExpenseErrorCode.NOT_EXPENSE_OWNER));
            if (teamMember.getRole() != TeamRole.ADMIN) {
                throw new ExpenseException(ExpenseErrorCode.NOT_EXPENSE_OWNER);
            }
        }

        // 4. 승인 대기 상태만 삭제 가능 (승인·반려로 처리 끝난 건 불가)
        if (!isPending(expense)) {
            throw new ExpenseException(ExpenseErrorCode.CANNOT_DELETE_NOT_PENDING);
        }

        // 5. 자식부터 삭제 (FK 제약) → 알림, 심사기록
        notificationRepository.deleteByExpenseId(expenseId);
        expensesReviewRepository.deleteByExpenseId(expenseId);

        // 6. 지출 완전 삭제
        expenseRepository.delete(expense);

        // 7. 응답 반환
        return ExpenseDeleteResponse.of();
    }

    // 승인 대기 상태인지 판별 (SUBMITTED 또는 ESCALATED)
    // 수정·삭제 둘 다 "대기 건만 허용"이라 공통으로 뺌
    private boolean isPending(Expense expense) {
        ExpenseStatus status = expense.getStatus();
        return status == ExpenseStatus.SUBMITTED || status == ExpenseStatus.ESCALATED;
    }

    @Transactional(readOnly = true)
    public String getReportCsv(Long teamId) {

        // 이 팀 소속인지 확인 (아니면 403) — teamId만 바꿔 남의 팀 CSV 못 받게
        checkTeamMembership(teamId);

        List<Expense> expenses =
                expenseRepository.findByTeamIdAndStatusOrderByApprovedAtDesc(
                        teamId,
                        ExpenseStatus.APPROVED
                );

        StringBuilder csv = new StringBuilder();

        // UTF-8 BOM
        csv.append('\uFEFF');

        csv.append("항목,카테고리,요청자,날짜,금액\n");

        for (Expense expense : expenses) {

            String title = escapeCsv(expense.getTitle());

            String category = expense.getCategory() == null
                    ? ""
                    : escapeCsv(expense.getCategory().name());

            String requesterName = expense.getUser() == null
                    ? ""
                    : escapeCsv(expense.getUser().getName());

            String date = expense.getApprovedAt() == null
                    ? ""
                    : expense.getApprovedAt().toLocalDate().toString();

            String amount = expense.getAmount() == null
                    ? ""
                    : expense.getAmount().toString();

            csv.append(title)
                    .append(",")
                    .append(category)
                    .append(",")
                    .append(requesterName)
                    .append(",")
                    .append(date)
                    .append(",")
                    .append(amount)
                    .append("\n");
        }

        return csv.toString();
    }

    private String escapeCsv(String value) {

        if (value == null) {
            return "";
        }

        if (value.contains(",")
                || value.contains("\"")
                || value.contains("\n")
                || value.contains("\r")) {

            return "\"" + value.replace("\"", "\"\"") + "\"";
        }

        return value;
    }
}