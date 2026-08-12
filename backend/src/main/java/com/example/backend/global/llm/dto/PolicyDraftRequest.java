package com.example.backend.global.llm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

/**
 * LLM-005 (AI 마법사 통합 요청) 요청 바디
 * POST {llm.base-url}/v1/policy-draft
 *
 * LLM 서버는 snake_case를 쓰기 때문에 @JsonProperty로 필드명을 하나씩 맞춰줌.
 * (우리 프로젝트는 camelCase라 이름이 다름 — 여기서만 변환)
 *
 * null인 선택 필드는 아예 빼고 보냄 (@JsonInclude NON_NULL)
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PolicyDraftRequest {

    // ===== 필수 =====

    @JsonProperty("team_id")
    private Long teamId;

    // 모임 유형 (동아리_학생회 / 스터디 / 친목 / 동호회 / 회사)
    // ※ LLM팀과 문자열이 정확히 일치해야 함 — 확인 필요 항목
    @JsonProperty("team_type")
    private String teamType;

    @JsonProperty("team_name")
    private String teamName;

    // 초기 예산 총액 (budgets.total_budget)
    @JsonProperty("initial_budget")
    private Long initialBudget;

    // 관리자 확인 설정 금액 (team_settings.auto_approve_limit)
    // 이 금액 이상은 관리자가 직접 확인
    @JsonProperty("force_escalation_amount")
    private Long forceEscalationAmount;

    // 회칙 등록 방식 (file / manual / ai / skip)
    @JsonProperty("rule_source")
    private String ruleSource;

    // ===== 선택 =====

    @JsonProperty("member_count")
    private Integer memberCount;

    // 모임 소개. 있으면 모임 특색 조항을 최대 3개 추가해줌
    @JsonProperty("description")
    private String description;

    // 1인당 회비. null 또는 0이면 '없음'. 보내면 회비 조항이 1개 더 붙음
    @JsonProperty("dues")
    private Long dues;

    // rule_source=manual일 때 직접 입력한 회칙 원문
    @JsonProperty("rule_text")
    private String ruleText;

    // rule_source=file일 때, LLM이 BE-005로 파일을 되물을 참조 키
    @JsonProperty("rule_file_ref")
    private String ruleFileRef;
}
