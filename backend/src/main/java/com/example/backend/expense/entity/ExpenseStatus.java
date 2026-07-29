package com.example.backend.expense.entity;

public enum ExpenseStatus {
    SUBMITTED,   // 승인 대기
    ESCALATED,   // 에스컬레이션 (관리자 확인 필요)
    APPROVED,    // 승인
    REJECTED     // 반려
}