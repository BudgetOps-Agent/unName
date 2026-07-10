package com.example.backend.member.dto;

import com.example.backend.member.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

// API-013 (마이페이지 유저 정보 조회) 응답용 DTO
@Getter
@Builder
public class MyPageResponse {

    private boolean success;
    private UserInfo user;
    private List<TeamInfo> teams;

    // 유저 기본 정보를 담는 내부 클래스
    @Getter
    @Builder
    public static class UserInfo {
        private String name;
        private String role;      // users.role 값 그대로 (지금은 String, enum으로 되어있으면 .toString() 붙이면 됨)
        private String email;
        private String phone;
        private String createdAt;

        // User 엔티티를 받아서 UserInfo로 변환하는 메서드
        public static UserInfo fromEntity(User user) {
            return UserInfo.builder()
                    .name(user.getName())
                    .role(user.getRole())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .createdAt(user.getCreatedAt().toString())
                    .build();
        }
    }

    // 내가 속한 모임 정보를 담는 내부 클래스
    @Getter
    @Builder
    public static class TeamInfo {
        private String name;
        private long memberCount;
        private String role;
    }
}