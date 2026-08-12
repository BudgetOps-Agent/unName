package com.example.backend.teamMember.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AcceptInviteResponse {

    private boolean success;
    private String message;
}