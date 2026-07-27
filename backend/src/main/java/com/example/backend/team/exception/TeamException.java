package com.example.backend.team.exception;

public class TeamException extends RuntimeException {
    private final TeamErrorCode errorCode;

    public TeamException(TeamErrorCode errorCode) {
       super(errorCode.getMessage());
       this.errorCode = errorCode;
    }

    public TeamErrorCode getErrorCode() {
        return errorCode;
    }
}
