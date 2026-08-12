package com.example.backend.teamMember.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

// API-038 (모임 멤버 목록 조회) 응답용 DTO
@Getter
@Builder
public class TeamMemberListResponse {

    private boolean success;
    private List<MemberInfo> members;

    // 멤버 한 명의 정보를 담는 내부 클래스
    @Getter
    @Builder
    public static class MemberInfo {
        private Long id;      // TeamMember의 id (권한변경/강퇴 API에서 memberId로 씀)
        private String name;
        private String email;
        private String role;  // TeamRole을 .name()으로 변환해서 String으로 보냄
    }
}