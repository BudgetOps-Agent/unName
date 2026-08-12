package com.example.backend.dashboard.dto;

import com.example.backend.expense.entity.ExpenseStatus;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

// API-023 (대시보드 조회) 응답용 DTO
@Getter
@Builder
public class DashboardResponse {

    private boolean success;
    private DashboardInfo dashboard;

    @Getter
    @Builder
    public static class DashboardInfo {
        private Long totalBudget;              // 총 예산
        private Long usedBudget;               // 사용 예산
        private Long remainingBudget;          // 남은 예산
        private int usagePercentage;           // 예산 사용률 (%)
        private long memberCount;              // 모임 인원 수
        private long pendingApprovalCount;     // 승인 대기 건수
        private Long pendingAmount;            // 승인 대기 금액 합계
        private List<ExpenseInfo> recentExpenses; // 승인 대기 미리보기 (2개)
    }

    @Getter
    @Builder
    public static class ExpenseInfo {
        private Long id;
        private String title;
        private Long amount;
        private ExpenseStatus status;
        private String requesterName;
        private String date;
    }
}