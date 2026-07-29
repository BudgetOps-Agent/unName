package com.example.backend.expense.exception;

import org.springframework.http.HttpStatus;

public enum ExpenseErrorCode {

    // 지출 건을 못 찾을 때 (017~021 공통)
    EXPENSE_NOT_FOUND(HttpStatus.NOT_FOUND, "지출 내역을 찾을 수 없습니다."),

    // 작성자 본인이 아닌데 수정/삭제하려 할 때 (018, 021)
    NOT_EXPENSE_OWNER(HttpStatus.FORBIDDEN, "본인이 작성한 지출만 처리할 수 있습니다."),

    // 승인된 지출을 수정하려 할 때 (018)
    CANNOT_MODIFY_APPROVED(HttpStatus.BAD_REQUEST, "승인된 지출은 수정할 수 없습니다."),

    // 관리자 권한이 없는데 승인/반려하려 할 때 (019, 020)
    NOT_AUTHORIZED_TO_APPROVE(HttpStatus.FORBIDDEN, "승인/반려 권한이 없습니다.");

    private final HttpStatus status;
    private final String message;

    ExpenseErrorCode(HttpStatus status, String message) {
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