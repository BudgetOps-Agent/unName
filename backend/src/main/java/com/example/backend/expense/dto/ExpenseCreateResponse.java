package com.example.backend.expense.dto;

import com.example.backend.expense.entity.Expense;
import com.example.backend.expense.entity.ExpenseStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder // 늘 쓰던 @Getter + @Builder 스타일
public class ExpenseCreateResponse {

    private boolean success;         // 성공 여부 (항상 true로 내려줌)
    private Long expenseId;          // 방금 등록된 지출의 id (프론트가 상세로 이동할 때 씀)
    private ExpenseStatus status;    // 등록 시점 상태 (지금은 항상 SUBMITTED, 나중에 자동승인 붙으면 달라짐)
    private LocalDateTime createdAt; // 등록 시간

    // Expense 엔티티 → 응답 DTO로 변환하는 정적 메서드 (fromEntity 패턴)
    // 저장된 Expense를 받아서 프론트에 필요한 값만 뽑아 담음
    public static ExpenseCreateResponse fromEntity(Expense expense) {
        return ExpenseCreateResponse.builder()
                .success(true)
                .expenseId(expense.getId())
                .status(expense.getStatus())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}