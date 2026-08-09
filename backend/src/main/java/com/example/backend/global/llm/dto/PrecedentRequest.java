package com.example.backend.global.llm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

/**
 * LLM-007 판례 저장 요청 바디 (백엔드 → LLM)
 * POST /v1/precedents
 *
 * 관리자가 지출을 최종 승인/반려하면 그 결정을 판례로 적재한다.
 * 다음 심사에서 유사 판례로 검색되어 AI 판단에 반영됨.
 * (공통 규약대로 snake_case)
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PrecedentRequest {

    @JsonProperty("team_id")
    private Long teamId;

    @JsonProperty("expense_id")
    private Long expenseId;

    // 무엇에 대한 판단인지 — 지출 제목/내용
    @JsonProperty("claim")
    private String claim;

    // 관리자 결정 (approved / rejected)
    @JsonProperty("decision")
    private String decision;

    // 결정 사유 (반려 사유 등)
    @JsonProperty("reason")
    private String reason;

    // AI 판정을 뒤집은 경우 true (AI가 APPROVED/REJECTED로 확정한 걸 관리자가 반대로 결정)
    @JsonProperty("is_override")
    private Boolean isOverride;

    // 적용된 회칙 버전 — 우리는 팀당 1개(버전 미사용)라 보통 null
    @JsonProperty("rule_version")
    private Integer ruleVersion;
}
