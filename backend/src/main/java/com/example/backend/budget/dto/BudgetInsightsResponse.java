package com.example.backend.budget.dto;

import com.example.backend.global.llm.dto.BudgetInsightsResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * AI 예산 관리 추천 (API-052) 응답 DTO — 프론트 '예산 관리 → AI 추천' 3블록용
 *
 * verified=false 면 프론트가 '확인 필요' 표시 권장 (틀린 수치 노출 방지)
 */
@Getter
@Builder
public class BudgetInsightsResponse {

    private boolean success;
    private Insights insights;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor   // Redis 캐시(JSON) 역직렬화용
    @AllArgsConstructor  // @Builder와 함께 쓰기 위해
    public static class Insights {
        private String categoryAnalysis;      // 카테고리별 분석 블록
        private String budgetStatusAnalysis;  // 예산 현황 분석 블록
        private String recommendation;         // AI 추천 블록
        private Object figures;                // 인용 수치 원본 (프론트 선택 사용)
        private Boolean verified;              // 수치 대조 통과 여부
    }

    // LLM-004 결과(BudgetInsightsResult) → 프론트 응답으로 변환
    public static BudgetInsightsResponse from(BudgetInsightsResult result) {
        Insights insights = Insights.builder()
                .categoryAnalysis(result == null ? null : result.getCategoryAnalysis())
                .budgetStatusAnalysis(result == null ? null : result.getBudgetStatusAnalysis())
                .recommendation(result == null ? null : result.getRecommendation())
                .figures(result == null ? null : result.getFigures())
                .verified(result == null ? null : result.getVerified())
                .build();

        return BudgetInsightsResponse.builder()
                .success(true)
                .insights(insights)
                .build();
    }
}
