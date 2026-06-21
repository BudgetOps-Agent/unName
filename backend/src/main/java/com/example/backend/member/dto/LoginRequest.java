package com.example.backend.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter // private여서 외부에서 쓸 수 있게 쓰는거
public class LoginRequest {

    @NotBlank(message = "이메일을 입력해주세요") // null이거나 빈칸이면 안됨
    @Email(message = "유효한 이메일 형식이어야 합니다.") // @와 같은 이메일 형식인지 검증하는거
    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요")
    private String password;
}