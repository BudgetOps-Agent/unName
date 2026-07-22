package com.example.backend.member.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VerifyUserResponse {

    private boolean success;
    private String message;
    private String verifyToken;
}