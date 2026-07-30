package com.example.backend.expense.dto;

import com.example.backend.expense.entity.Expense;
import com.example.backend.expense.entity.ExpenseStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ExpenseRejectResponse {

    private boolean success;         // 성공 여부
    private ExpenseStatus status;    // 처리 후 상태 (REJECTED)
    private LocalDateTime approvedAt; // 처리(반려) 확정 시각

    // Expense 엔티티 → 반려 응답 DTO 변환
    public static ExpenseRejectResponse fromEntity(Expense expense) {
        return ExpenseRejectResponse.builder()
                .success(true)
                .status(expense.getStatus())
                .approvedAt(expense.getApprovedAt())
                .build();
    }
}