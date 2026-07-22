package com.example.backend.teamMember.dto;

import lombok.Builder;
import lombok.Getter;

// API-039 관리자 권한 위임 응답 DTO
@Getter
@Builder
public class TransferAdminResponse {

    private boolean success;
    private String message;
}