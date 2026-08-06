package com.example.backend.policy.exception;

import lombok.Getter;

@Getter
public class PolicyException extends RuntimeException {

    private final PolicyErrorCode errorCode;

    public PolicyException(PolicyErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
