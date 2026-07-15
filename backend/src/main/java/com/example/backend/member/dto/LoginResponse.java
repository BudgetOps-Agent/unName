package com.example.backend.member.dto;

import com.example.backend.member.entity.Role;
import lombok.Builder;
import lombok.Getter;

@Getter // 게터
@Builder // 객체 만들때 빌더 패턴을 쓸 수 있게 해주는 어노테이션
public class LoginResponse {

    private boolean success; // 로그인 성공 여부
    private UserInfo user; // 유저 정보

    @Getter
    @Builder
    public static class UserInfo {
        private Long id;        // 유저 id PK
        private String email;   // 이메일
        private String name;    // 이름
        private Role role;    // 권한
    }
}