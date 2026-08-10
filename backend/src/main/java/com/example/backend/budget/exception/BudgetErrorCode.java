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
    // 팀에 예산 row가 없을 때 (명세 API-026·027 기준 404)
    BUDGET_NOT_FOUND(
            HttpStatus.NOT_FOUND,
                "예산 정보를 찾을 수 없습니다."
            ),

    // 관리자·총무가 아닌데 예산을 수정하려 할 때 (API-027)
    NOT_ADMIN_FOR_BUDGET(
            HttpStatus.FORBIDDEN,
            "관리자만 예산을 수정할 수 있습니다."
    ),

    // 관리자·총무가 아닌데 예산·AI예산을 조회하려 할 때 (API-026·052)
    NOT_AUTHORIZED_TO_VIEW(
            HttpStatus.FORBIDDEN,
            "관리자 또는 총무만 조회할 수 있습니다."
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
