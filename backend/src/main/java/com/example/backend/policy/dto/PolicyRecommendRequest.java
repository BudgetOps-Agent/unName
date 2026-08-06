package com.example.backend.policy.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// AI 정책 추천(API-044) 요청용 DTO
// 명세대로 teamId를 body로 받음 (경로가 /api/policies/recommend라 URL에 팀이 안 들어감)
@Getter
@Setter
@NoArgsConstructor
public class PolicyRecommendRequest {

    @NotNull(message = "teamId는 필수입니다.")
    private Long teamId;
}
