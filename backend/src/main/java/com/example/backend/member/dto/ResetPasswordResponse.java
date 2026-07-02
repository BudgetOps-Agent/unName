package com.example.backend.member.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ResetPasswordResponse {

    private boolean success;
    private String message;
}