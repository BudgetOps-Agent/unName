package com.example.backend.expense.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

// API-050 (정산 리포트 조회) 응답용 DTO
@Getter
@Builder
public class ReportExpenseListResponse {

    private boolean success;
    private int page;
    private int size;
    private long totalElements;
    private long totalPages;
    private List<ExpenseInfo> expenses; // 지출 명세 목록

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