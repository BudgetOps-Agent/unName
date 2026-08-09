package com.example.backend.global.llm.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * LLM-016 예산 인사이트 결과 본문 (LLM-004 응답의 result 안에 담겨 옴)
 *
 * 화면의 'AI 추천 예산 관리' 3블록:
 *   category_analysis        : 비중 높은 카테고리와 적정성 코멘트
 *   budget_status_analysis   : 사용률·월말 초과 가능성·예비비 권고
 *   recommendation           : 절감 여지와 활용 제안
 * 공통:
 *   figures  : 본문에 인용된 수치의 원본 집계값 (스키마 미확정 → Object)
 *   verified : 본문 수치와 집계값 대조 통과 여부 (false면 '확인 필요' 표시)
 */
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class BudgetInsightsResult {

    @JsonProperty("category_analysis")
    private String categoryAnalysis;

    @JsonProperty("budget_status_analysis")
    private String budgetStatusAnalysis;

    @JsonProperty("recommendation")
    private String recommendation;

    @JsonProperty("figures")
    private Object figures;

    @JsonProperty("verified")
    private Boolean verified;
}
