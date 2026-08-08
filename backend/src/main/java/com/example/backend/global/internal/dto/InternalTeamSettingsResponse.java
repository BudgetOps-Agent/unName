package com.example.backend.global.internal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

// BE-002 팀 설정 조회 (LLM 심사용) 응답
// 자동승인 권한·한도 — 가드레일 최상위 게이트
@Getter
@Builder
public class InternalTeamSettingsResponse {

    @JsonProperty("auto_approve")
    private Boolean autoApprove;        // 자동승인 사용 여부

    @JsonProperty("auto_approve_limit")
    private Long autoApproveLimit;      // 관리자 설정 금액(이하 자동승인). 미사용 시 null
}
