package com.example.backend.global.llm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

/**
 * LLM-016 예산 관리 AI 메시지 요청 바디 (백엔드 → LLM)
 * POST /v1/budget-insights — 202 접수 응답(잡 방식). 결과는 LLM-004로 폴링.
 * (공통 규약대로 snake_case)
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BudgetInsightsRequest {

    @JsonProperty("team_id")
    private Long teamId;

    // 기간(YYYY-MM). 미지정 시 LLM이 당월로 처리 → 보통 null로 미전송
    @JsonProperty("period")
    private String period;
}
