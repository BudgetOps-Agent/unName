package com.example.backend.expense.entity;

public enum FinalVerdict {
    APPROVED,   // 승인
    REJECTED,   // 반려
    ESCALATED   // 관리자 확인 필요 (AI가 판단 보류)
}