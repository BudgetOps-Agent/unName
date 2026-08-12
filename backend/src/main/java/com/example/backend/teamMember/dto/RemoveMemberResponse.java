package com.example.backend.teamMember.dto;

import lombok.Builder;
import lombok.Getter;

// API-041 멤버 추방 응답 DTO
@Getter
@Builder
public class RemoveMemberResponse {

    private boolean success;
    private String message;
}