package com.example.backend.expense.dto;

import com.example.backend.expense.entity.Expense;
import com.example.backend.expense.entity.ExpenseStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

// 지출 수정(API-018) 응답 DTO
// 명세: success + 수정된 지출 전체 객체(expense)
@Getter
@Builder
public class ExpenseUpdateResponse {

    private boolean success;      // 성공 여부 (항상 true)
    private ExpenseInfo expense;  // 수정된 지출 정보

    @Getter
    @Builder
    public static class ExpenseInfo {
        private Long id;
        private String title;
        private Long amount;
        private String category;        // 카테고리(enum 이름). AI 심사 전이면 null
        private String description;
        private String receiptFileUrl;  // 영수증 파일 경로
        private ExpenseStatus status;
        private LocalDateTime updatedAt;
    }

    public static ExpenseUpdateResponse fromEntity(Expense expense) {
        ExpenseInfo info = ExpenseInfo.builder()
                .id(expense.getId())
                .title(expense.getTitle())
                .amount(expense.getAmount())
                // 카테고리는 AI 심사 전엔 null이라 NPE 방지 (name()은 null에서 못 부름)
                .category(expense.getCategory() == null ? null : expense.getCategory().name())
                .description(expense.getDescription())
                .receiptFileUrl(expense.getReceiptUrl())
                .status(expense.getStatus())
                .updatedAt(expense.getUpdatedAt())
                .build();

        return ExpenseUpdateResponse.builder()
                .success(true)
                .expense(info)
                .build();
    }
}
