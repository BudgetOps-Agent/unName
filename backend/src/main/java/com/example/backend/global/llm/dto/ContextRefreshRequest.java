package com.example.backend.global.llm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

/**
 * LLM-006 회칙 변경 알림 요청 바디 (백엔드 → LLM)
 * POST /v1/context/refresh — 202 접수. 원문은 LLM이 BE-005로 되물어 감(pull).
 * (공통 규약대로 snake_case)
 *
 * 호출 시점: 회칙 저장/등록/수정 직후, 개정 제안 승인 반영 직후.
 * 이걸 안 부르면 LLM이 계속 옛 회칙으로 심사한다.
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContextRefreshRequest {

    @JsonProperty("team_id")
    private Long teamId;

    // 변경 종류: rule · category · params  (회칙 저장이면 "rule")
    @JsonProperty("change_type")
    private String changeType;

    // 회칙 버전. LLM팀이 이 파라미터를 뺐다고 해서 기본은 미전송(null).
    // 명세엔 남아 있어 혹시 필요하면 채워 보낼 수 있게 필드만 둠 (NON_NULL이라 null이면 안 나감).
    @JsonProperty("version")
    private Integer version;
}
