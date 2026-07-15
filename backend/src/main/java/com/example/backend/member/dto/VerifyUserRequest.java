package com.example.backend.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class VerifyUserRequest {

    @NotBlank(message = "이메일을 입력해주세요")
    @Email(message = "유효한 이메일 형식이어야 합니다.")
    private String email;

    @NotBlank(message = "이름을 입력해주세요")
    private String name;
}