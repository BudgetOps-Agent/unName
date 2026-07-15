package com.example.backend.teamMember.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InviteMemberResponse {

    private boolean success; // 성공 여부
    private String message;  // 응답 메시지
}