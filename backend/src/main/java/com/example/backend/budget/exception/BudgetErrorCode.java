package com.example.backend.budget.exception;

import org.springframework.http.HttpStatus;

/**
 * BudgetErrorCode 역할
 *
 * 예산 관련 에러를 관리한다.
 *
 * 사용 예시
 *
 * 예산 정보 못 찾음
 * ↓
 * BUDGET_NOT_FOUND
 *
 * 처리 순서
 *
 * Service
 * ↓
 * 에러 발생
 * ↓
 * BudgetErrorCode 선택
 * ↓
 * BudgetException 전달
 */


public enum BudgetErrorCode {
    BUDGET_NOT_FOUND(
            HttpStatus.INTERNAL_SERVER_ERROR,
                "예산 정보를 찾을 수 없습니다."
            );
    private final HttpStatus status;
    private final String message;

    BudgetErrorCode(
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
