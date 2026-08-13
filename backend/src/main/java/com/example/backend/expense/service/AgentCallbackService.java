package com.example.backend.expense.service;

import com.example.backend.budget.entity.Budget;
import com.example.backend.budget.repository.BudgetRepository;
import com.example.backend.expense.entity.Expense;
import com.example.backend.expense.entity.ExpenseCategory;
import com.example.backend.expense.entity.ExpenseStatus;
import com.example.backend.expense.entity.ExpensesReview;
import com.example.backend.expense.entity.FinalVerdict;
import com.example.backend.expense.entity.ProcessedBy;
import com.example.backend.expense.exception.ExpenseErrorCode;
import com.example.backend.expense.exception.ExpenseException;
import com.example.backend.expense.repository.ExpenseRepository;
import com.example.backend.expense.repository.ExpensesReviewRepository;
import com.example.backend.global.llm.dto.AgentCallbackRequest;
import com.example.backend.notification.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * CB-001 심사 결과 콜백 처리 (LLM 서버 → 백엔드)
 *
 * LLM이 심사를 끝내고 /agent-callback 으로 결과를 보내면:
 *  1) 지출 상태를 승인/반려/에스컬레이션으로 바꾸고
 *  2) AI가 분류한 카테고리(null이었던 값)를 채우고
 *  3) 승인이면 예산(usedBudget)에 반영하고
 *  4) 심사 기록(expenses_reviews)을 남긴다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgentCallbackService {

    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final ExpensesReviewRepository expensesReviewRepository;
    private final NotificationService notificationService; // AI 자동 승인/반려 시 작성자 알림용

    // ObjectMapper는 주입 대신 자체 생성 — Spring Boot 4의 Jackson 빈 타입(2 vs 3) 불일치로 인한
    // "주입 가능한 빈 없음" 시작 오류를 피하려고 인스턴스를 직접 만든다 (@RequiredArgsConstructor에서 제외됨)
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public void handleCallback(AgentCallbackRequest req) {

        // dryRun(시험용)이면 실제 저장하지 않고 로그만
        if (Boolean.TRUE.equals(req.getDryRun())) {
            log.info("[CB-001] dryRun 콜백 수신 expenseId={} verdict={} — 저장 안 함",
                    req.getExpenseId(), req.getVerdict());
            return;
        }

        if (req.getExpenseId() == null) {
            throw new ExpenseException(ExpenseErrorCode.EXPENSE_NOT_FOUND);
        }

        // 대상 지출 조회 (없으면 404)
        Expense expense = expenseRepository.findById(req.getExpenseId())
                .orElseThrow(() -> new ExpenseException(ExpenseErrorCode.EXPENSE_NOT_FOUND));

        // 멱등 처리: 콜백은 중복 도착할 수 있음(최대 3회 재시도 + 폴링 안전망).
        // 최초 SUBMITTED 상태일 때만 처리하고, 이미 옮겨진 건은 무시한다.
        if (expense.getStatus() != ExpenseStatus.SUBMITTED) {
            log.info("[CB-001] 이미 처리된 지출이라 콜백 무시 expenseId={} status={}",
                    expense.getId(), expense.getStatus());
            return;
        }

        // AI가 분류한 카테고리 파싱 (9종 언더바 표기). 없거나 목록 밖이면 기타로 접고 경고 로그
        ExpenseCategory category = parseCategory(req.getSuggestedCategory());

        // 심사 근거를 JSON 문자열로 (expenses_reviews.detail 저장용)
        String detail = buildDetailJson(req);

        // verdict → 상태 매핑 후 처리
        Verdict verdict = mapVerdict(req.getVerdict());
        switch (verdict) {
            case APPROVED -> applyApprove(expense, category, detail);
            case REJECTED -> applyReject(expense, category, detail, extractReasonText(req));
            case ESCALATED -> applyEscalate(expense, category, detail);
        }

        log.info("[CB-001] 콜백 반영 완료 expenseId={} verdict={} category={}",
                expense.getId(), verdict, category);
    }

    // 승인: 상태 변경 + 예산 차감 + 심사기록(AI)
    private void applyApprove(Expense expense, ExpenseCategory category, String detail) {
        expense.aiApprove(category);

        // 승인이면 예산(usedBudget)에 지출 금액 반영
        Budget budget = budgetRepository.findByTeamId(expense.getTeam().getId())
                .orElseThrow(() -> new ExpenseException(ExpenseErrorCode.EXPENSE_NOT_FOUND));
        budget.addUsedBudget(expense.getAmount());

        saveReview(expense, FinalVerdict.APPROVED, detail, category);

        // AI가 자동 승인 → 작성자에게 승인 알림 (처리자=AI라 processor=null)
        notificationService.notifyApproved(expense, null);
    }

    // 반려: 상태/사유 변경 + 심사기록(AI)
    private void applyReject(Expense expense, ExpenseCategory category, String detail, String reason) {
        expense.aiReject(category, reason);
        saveReview(expense, FinalVerdict.REJECTED, detail, category);

        // AI가 자동 반려 → 작성자에게 반려 알림 (처리자=AI라 processor=null)
        notificationService.notifyRejected(expense, null);
    }

    // 에스컬레이션: 관리자 확인 대기 상태로 + AI 소견 기록(최종 아님)
    private void applyEscalate(Expense expense, ExpenseCategory category, String detail) {
        expense.aiEscalate(category);
        saveReview(expense, FinalVerdict.ESCALATED, detail, category);
    }

    private void saveReview(Expense expense, FinalVerdict verdict, String detail, ExpenseCategory category) {
        ExpensesReview review = ExpensesReview.builder()
                .expense(expense)
                .finalVerdict(verdict)
                .detail(detail)
                .suggestedCategory(category == null ? null : category.name())
                .processedBy(ProcessedBy.AI)
                .build();
        expensesReviewRepository.save(review);
    }

    // 카테고리 문자열 → ExpenseCategory. 없거나 9종 밖이면 기타로 접고 경고 (LLM팀 합의: 목록 밖은 기타)
    private ExpenseCategory parseCategory(String suggested) {
        if (suggested == null || suggested.isBlank()) {
            return null; // 분류가 안 온 경우 (드묾) — null 유지
        }
        try {
            return ExpenseCategory.valueOf(suggested.trim());
        } catch (IllegalArgumentException e) {
            log.warn("[CB-001] 9종에 없는 카테고리 '{}' → 기타로 저장", suggested);
            return ExpenseCategory.기타;
        }
    }

    // verdict 문자열을 우리 3-상태로 매핑 (대소문자·표현 흔들림 흡수, 모르면 안전하게 에스컬레이션)
    private Verdict mapVerdict(String raw) {
        String v = (raw == null) ? "" : raw.trim().toLowerCase();
        return switch (v) {
            case "approved", "approve", "auto_approved", "auto-approve", "pass" -> Verdict.APPROVED;
            case "rejected", "reject", "fail", "denied" -> Verdict.REJECTED;
            default -> Verdict.ESCALATED; // escalated/warn/needs_review/알 수 없음 → 관리자 확인
        };
    }

    private enum Verdict { APPROVED, REJECTED, ESCALATED }

    // 반려 사유 텍스트 뽑기.
    // reasons가 문자열이면 그대로, {"requester":..., "admin":...}처럼 대상별로 나뉜 객체면
    // 화면(요청자용) 문구인 requester 값만 사용, 그 외 형태는 JSON 문자열로. 500자 제한.
    // admin용 상세 근거는 buildDetailJson()이 원본 reasons를 통째로 저장해두므로 안 사라짐.
    private String extractReasonText(AgentCallbackRequest req) {
        Object reasons = req.getReasons();
        if (reasons == null) return "AI 심사 반려";

        String text;
        if (reasons instanceof String s) {
            text = s;
        } else if (reasons instanceof Map<?, ?> map && map.get("requester") != null) {
            text = String.valueOf(map.get("requester"));
        } else {
            text = safeJson(reasons);
        }
        return text.length() > 500 ? text.substring(0, 500) : text;
    }

    // detail(json 컬럼)용 — verdict·신뢰도·근거·소견을 JSON으로. 실패해도 콜백은 안 깨지게 null 반환
    private String buildDetailJson(AgentCallbackRequest req) {
        try {
            Map<String, Object> detail = new java.util.LinkedHashMap<>();
            detail.put("verdict", req.getVerdict());
            detail.put("confidence", req.getConfidence());
            detail.put("processedBy", req.getProcessedBy());
            detail.put("reasons", req.getReasons());
            detail.put("opinions", req.getOpinions());
            detail.put("mismatch", req.getMismatch());
            return objectMapper.writeValueAsString(detail);
        } catch (Exception e) {
            log.warn("[CB-001] detail 직렬화 실패 — null로 저장", e);
            return null;
        }
    }

    private String safeJson(Object o) {
        try {
            return objectMapper.writeValueAsString(o);
        } catch (Exception e) {
            return String.valueOf(o);
        }
    }
}
