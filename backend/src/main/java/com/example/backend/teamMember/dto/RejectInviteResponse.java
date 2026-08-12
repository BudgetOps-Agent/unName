package com.example.backend.teamMember.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RejectInviteResponse {

    private boolean success;
    private String message;
}