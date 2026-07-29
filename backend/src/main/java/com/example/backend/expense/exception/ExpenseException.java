package com.example.backend.expense.exception;

import lombok.Getter;

@Getter
public class ExpenseException extends RuntimeException {

    private final ExpenseErrorCode errorCode;

    public ExpenseException(ExpenseErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}