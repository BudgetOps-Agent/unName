package com.example.backend.teamMember.dto;

import lombok.Builder;
import lombok.Getter;

// API-040 멤버 권한 변경 응답 DTO
@Getter
@Builder
public class ChangeRoleResponse {

    private boolean success;
    private MemberInfo member;

    @Getter
    @Builder
    public static class MemberInfo {
        private Long id;
        private String name;
        private String role;
    }
}