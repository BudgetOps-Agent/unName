package com.example.backend.global.llm.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * LLM-005 (AI 마법사 통합 요청) 응답 바디
 *
 * @JsonIgnoreProperties(ignoreUnknown = true)
 * → LLM팀이 필드를 추가해도 우리 쪽이 안 터지게. 모르는 필드는 그냥 무시함
 */
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PolicyDraftResponse {

    // 회칙 초안 (조항 단위). rule_source=ai일 때만 채워지고 그 외엔 빈 배열
    //
    // 각 항목은 완결된 조항 한 문장(문자열)임 — 객체 아님 (LLM팀 8/6 회신으로 확정)
    // 예: ["50,000원 이상 지출은 관리자 승인을 받아야 한다.", "회비는 1인당 10,000원으로 한다."]
    @JsonProperty("rules")
    private List<String> rules;

    // 추천 지출 카테고리 (전역 9종 고정, 모임 유형과 무관)
    @JsonProperty("recommended_categories")
    private List<String> recommendedCategories;

    // 참고 문구
    @JsonProperty("notes")
    private String notes;
}
