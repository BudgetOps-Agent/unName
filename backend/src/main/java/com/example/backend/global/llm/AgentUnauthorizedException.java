package com.example.backend.global.llm;

/**
 * LLM/Agent가 우리 백엔드를 부를 때(콜백 CB-001, 내부 조회 API BE-001~) Agent 서비스 토큰이
 * 없거나 틀렸을 때 던지는 예외. GlobalExceptionHandler에서 401로 매핑된다.
 */
public class AgentUnauthorizedException extends RuntimeException {
    public AgentUnauthorizedException(String message) {
        super(message);
    }
}
