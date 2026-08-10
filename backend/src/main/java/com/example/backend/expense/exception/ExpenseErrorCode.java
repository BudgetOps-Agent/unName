// 지출 관련 에러 코드를 관리
package com.example.backend.expense.exception;

import org.springframework.http.HttpStatus;

/**
 * ExpenseErrorCode 역할
 *
 * 지출 관련 에러를 관리한다.
 *
 * 사용 예시
 *
 * 지출 없음
 * ↓
 * EXPENSE_NOT_FOUND
 *
 * 작성자 본인 아님
 * ↓
 * NOT_EXPENSE_OWNER
 *
 * 이미 처리된 지출
 * ↓
 * ALREADY_PROCESSED
 *
 * 처리 순서
 *
 * Service
 * ↓
 * 에러 발생
 * ↓
 * ExpenseErrorCode 선택
 * ↓
 * ExpenseException 전달
 */
public enum ExpenseErrorCode {

    // 지출 건을 못 찾을 때 (017~021 공통)
    EXPENSE_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "지출 내역을 찾을 수 없습니다."
    ),

    // 작성자 본인이 아닌데 수정/삭제하려 할 때 (018, 021)
    NOT_EXPENSE_OWNER(
            HttpStatus.FORBIDDEN,
            "본인이 작성한 지출만 처리할 수 있습니다."
    ),

    // 승인된 지출을 수정하려 할 때 (018)
    CANNOT_MODIFY_APPROVED(
            HttpStatus.BAD_REQUEST,
            "승인된 지출은 수정할 수 없습니다."
    ),

    // 승인 대기(SUBMITTED/ESCALATED)가 아닌 지출을 수정하려 할 때 (018)
    // 승인·반려로 이미 처리가 끝난 건은 수정 불가
    CANNOT_MODIFY_NOT_PENDING(
            HttpStatus.BAD_REQUEST,
            "승인 대기 상태의 지출만 수정할 수 있습니다."
    ),

    // 승인 대기(SUBMITTED/ESCALATED)가 아닌 지출을 삭제하려 할 때 (021)
    // 승인·반려로 이미 처리가 끝난 건은 삭제 불가
    CANNOT_DELETE_NOT_PENDING(
            HttpStatus.BAD_REQUEST,
            "승인 대기 상태의 지출만 삭제할 수 있습니다."
    ),

    // 관리자 권한이 없는데 승인/반려하려 할 때 (019, 020)
    NOT_AUTHORIZED_TO_APPROVE(
            HttpStatus.FORBIDDEN,
            "승인/반려 권한이 없습니다."
    ),

    // 이미 승인/반려 처리된 지출을 또 처리하려 할 때 (019, 020)
    // 409 Conflict = 현재 상태와 요청이 충돌한다는 의미
    ALREADY_PROCESSED(
            HttpStatus.CONFLICT,
            "이미 처리된 지출입니다."
    ),

    // 승인하려는데 남은 예산보다 지출 금액이 클 때 (019)
    // 409 Conflict = 예산 상태와 요청이 충돌
    BUDGET_EXCEEDED(
            HttpStatus.CONFLICT,
            "남은 예산이 부족하여 승인할 수 없습니다."
    ),

    // 관리자·총무가 아닌데 정산 리포트를 조회하려 할 때 (API-050·051)
    NOT_AUTHORIZED_TO_VIEW_REPORT(
            HttpStatus.FORBIDDEN,
            "관리자 또는 총무만 정산 리포트를 조회할 수 있습니다."
    );

    private final HttpStatus status;
    private final String message;

    ExpenseErrorCode(
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