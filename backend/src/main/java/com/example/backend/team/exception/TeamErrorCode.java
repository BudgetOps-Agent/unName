package com.example.backend.team.exception;

import com.example.backend.teamMember.exception.TeamMemberErrorCode;
import org.springframework.http.HttpStatus;

public enum TeamErrorCode {
    DUPLICATE_TEAM_NAME(
            HttpStatus.CONFLICT,
            "이미 존재하는 모임 이름입니다."
    );

    private  final HttpStatus status;
    private final String message;

    TeamErrorCode(
            HttpStatus status,
            String message
    ) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }
    public String getMessage() {
        return message;
    }
}
