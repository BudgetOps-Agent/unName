// 회칙(정책) 관련 에러 코드를 관리
package com.example.backend.policy.exception;

import org.springframework.http.HttpStatus;

/**
 * PolicyErrorCode 역할
 *
 * 회칙(정책) 관련 에러를 관리한다.
 *
 * 처리 순서
 *
 * Service
 * ↓
 * 에러 발생
 * ↓
 * PolicyErrorCode 선택
 * ↓
 * PolicyException 전달
 */
public enum PolicyErrorCode {

    // policyType=FILE인데 파일을 안 보냈을 때 (031)
    // 파일 업로드 방식이라고 해놓고 정작 file 파트가 비어있는 경우
    POLICY_FILE_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "파일 업로드 방식은 회칙 파일이 필수입니다."
    ),

    // policyType=TEXT인데 내용을 안 보냈을 때 (031)
    // 직접 입력 / AI 초안 둘 다 결국 TEXT라서 content가 반드시 있어야 함
    POLICY_CONTENT_REQUIRED(
            HttpStatus.BAD_REQUEST,
            "직접 입력 방식은 회칙 내용이 필수입니다."
    ),

    // 관리자가 아닌데 회칙을 등록/수정하려 할 때 (031)
    // 회칙은 AI 지출 심사 기준이 되는 문서라 관리자만 건드릴 수 있게 막음
    NOT_ADMIN_FOR_POLICY(
            HttpStatus.FORBIDDEN,
            "관리자만 회칙을 등록할 수 있습니다."
    );

    private final HttpStatus status;
    private final String message;

    PolicyErrorCode(
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
