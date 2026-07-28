package com.example.backend.expense.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

// API-050 (정산 리포트 조회) 응답용 DTO
@Getter
@Builder
public class ReportResponse {

    private boolean success;
    private ReportInfo report;

    // 상단 요약 카드 + 지출 명세를 담는 내부 클래스
    @Getter
    @Builder
    public static class ReportInfo {
        private Long totalExpense;          // 총 지출 (승인된 것 합계)
        private long approvedCount;         // 승인 건수
        private Long totalBudget;           // 총 예산
        private Long usedBudget;            // 사용 예산
        private Long remainingBudget;       // 남은 예산
        private int usagePercentage;        // 예산 사용률 (%)
        private List<ExpenseInfo> expenses; // 지출 명세 목록
    }

    // 지출 명세 한 줄
    @Getter
    @Builder
    public static class ExpenseInfo {
        private Long id;
        private String title;         // 항목
        private String category;      // 카테고리
        private String requesterName; // 요청자
        private String date;          // 승인 날짜
        private Long amount;          // 금액
    }
}