package com.example.backend.team.dto;

import lombok.Builder;
import lombok.Getter;

// 모임 삭제 응답 DTO — 관리자 혼자 남았을 때 모임 자체를 삭제
@Getter
@Builder
public class DeleteTeamResponse {

    private boolean success;
    private String message;
}
