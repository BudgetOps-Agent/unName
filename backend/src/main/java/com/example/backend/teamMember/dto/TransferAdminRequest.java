package com.example.backend.teamMember.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;

// API-039 관리자 권한 위임 요청 DTO
@Getter
public class TransferAdminRequest {

    // 새 관리자로 만들 TeamMember의 id
    @NotNull(message = "새 관리자 멤버 id는 필수입니다.")
    private Long newMemberId;
}