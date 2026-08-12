package com.example.backend.expense.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

// AI 심사 결과 조회(API-046) 응답 DTO
// 지출 상세 화면의 "AI 심사 결과" 카드(AIReviewCard.tsx)가 그대로 쓸 수 있는 형태로 내려줌
@Getter
@Builder
public class ExpenseReviewResultResponse {

    private boolean success;
    private ReviewInfo review; // 아직 AI 심사가 안 끝났으면(SUBMITTED) null

    @Getter
    @Builder
    public static class ReviewInfo {
        private List<Reviewer> reviewers;  // 심사관별 소견 (회칙/예산/이상탐지/증빙)
        private String finalVerdict;       // 지출의 현재 상태 (SUBMITTED/ESCALATED/APPROVED/REJECTED)
        private String processType;        // AUTO(자동처리) / ESCALATED(관리자 확인 필요)
        private String processor;          // 처리 주체 표시값 ("AI" 또는 최종 처리한 관리자 이름)
        private String category;           // AI가 분류한 카테고리 (없으면 "미분류")
        private String escalationReason;   // 에스컬레이션 사유(콜백 reasons.admin) — "관리자 직접 확인이 필요해요" 배너용, 없으면 null
    }

    // 프론트 AIReviewCard.tsx의 Reviewer 타입과 1:1 대응
    // verdict는 PASS/FAIL/HOLD 중 하나로 맞춰서 내려줌 (LLM 원본 pass/warn/fail/error → 변환)
    @Getter
    @Builder
    public static class Reviewer {
        private int id;
        private String verdict; // PASS / FAIL / HOLD
        private String opinion; // 심사관 소견 요약
        private String reason;  // 판정 근거 (근거 조항/불일치 항목 등)
    }
}
