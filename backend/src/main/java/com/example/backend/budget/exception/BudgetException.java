package com.example.backend.budget.exception;

public class BudgetException extends RuntimeException {
    private final BudgetErrorCode errorCode;

    public BudgetException(
            BudgetErrorCode errorCode
    ) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
    public BudgetErrorCode getErrorCode() {return errorCode;}
}
