package com.example.backend.expense.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReportSummaryResponse {

    private boolean success;
    private Long totalExpense;          // 총 지출 (승인된 것 합계)
    private long approvedCount;         // 승인 건수
    private Long totalBudget;           // 총 예산
    private Long usedBudget;            // 사용 예산
    private Long remainingBudget;       // 남은 예산
    private int usagePercentage;        // 예산 사용률 (%)
}
