package com.example.backend.member.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class FindIdRequest {

    @NotBlank(message = "이름을 입력해주세요")
    private String name;

    @NotBlank(message = "전화번호를 입력해주세요")
    private String phone;
}
