package com.example.backend.expense.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

// 월별 지출 통계 (막대그래프용, API-047)
@Getter
@Builder
public class MonthlyStatsResponse {

    private boolean success;
    private List<MonthlyData> statistics; // 월별 데이터 목록 (막대 하나 = 한 달)

    // 각 달의 데이터 (막대 하나에 해당)
    @Getter
    @Builder
    public static class MonthlyData {
        private String month;   // "2025-01" 형태 (연-월)
        private Long amount;    // 그 달의 승인 지출 합계
    }
}