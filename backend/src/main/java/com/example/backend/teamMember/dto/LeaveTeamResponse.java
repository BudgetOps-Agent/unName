package com.example.backend.teamMember.dto;

import lombok.Builder;
import lombok.Getter;

// API-043 모임 탈퇴 응답 DTO
@Getter
@Builder
public class LeaveTeamResponse {

    private boolean success;
    private String message;
}
