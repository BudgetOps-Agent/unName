package com.example.backend.global.internal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

// BE-006 팀 프로필 조회 (LLM 카테고리 카탈로그 선택용) 응답
// 모임 유형 5종 문자열이 LLM 쪽과 정확히 일치해야 함 (동아리_학생회 등 언더바 표기)
@Getter
@Builder
public class InternalTeamProfileResponse {

    @JsonProperty("team_type")
    private String teamType;
}
