package com.example.backend.teamMember.dto;

import com.example.backend.teamMember.entity.TeamRole;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

// API-040 멤버 권한 변경 요청 DTO
@Getter
public class ChangeRoleRequest {

    // 바꿀 역할 (ACCOUNTANT 또는 MEMBER)
    @NotNull(message = "변경할 역할은 필수입니다.")
    private TeamRole role;
}