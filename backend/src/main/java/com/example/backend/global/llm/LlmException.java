package com.example.backend.global.llm;

import lombok.Getter;

@Getter
public class LlmException extends RuntimeException {

    private final LlmErrorCode errorCode;

    public LlmException(LlmErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    // 원인 예외까지 같이 들고 있게 (로그에 스택트레이스 남기려고)
    public LlmException(LlmErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }
}
