package com.example.backend.global.internal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

// BE-003 예산 현황 조회 (LLM 예산 심사관용) 응답
// 잔액은 LLM이 total_budget - spent 로 계산함. 예산은 모임 전체 총액 하나
@Getter
@Builder
public class InternalBudgetResponse {

    @JsonProperty("total_budget")
    private Long totalBudget;  // 총 예산

    @JsonProperty("spent")
    private Long spent;        // 사용 예산(usedBudget)
}
