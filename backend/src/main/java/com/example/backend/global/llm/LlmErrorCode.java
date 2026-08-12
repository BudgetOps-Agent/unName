// LLM(Agent) 서버 연동 관련 에러 코드
package com.example.backend.global.llm;

import org.springframework.http.HttpStatus;

/**
 * LlmErrorCode 역할
 *
 * LLM 서버를 부르다가 실패했을 때의 에러를 관리한다.
 * 우리 서버 잘못이 아니라 "바깥 서버"가 문제인 경우라, 로그로 원인을 남기고
 * 사용자에게는 다시 시도해달라는 정도만 알려준다.
 */
public enum LlmErrorCode {

    // LLM 서버가 에러를 돌려줬을 때 (401/422/500 등)
    LLM_SERVER_ERROR(
            HttpStatus.BAD_GATEWAY,
            "AI 서버 응답에 실패했습니다. 잠시 후 다시 시도해주세요."
    ),

    // LLM 서버에 아예 연결이 안 되거나 시간 초과됐을 때
    LLM_UNAVAILABLE(
            HttpStatus.SERVICE_UNAVAILABLE,
            "AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요."
    );

    private final HttpStatus status;
    private final String message;

    LlmErrorCode(
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
