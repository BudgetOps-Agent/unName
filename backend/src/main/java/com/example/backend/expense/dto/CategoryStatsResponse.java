package com.example.backend.expense.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

// 카테고리별 지출 통계 (도넛차트용, API-048)
// 예산 관리 화면의 도넛차트에 쓰임 — 이번 달 승인된 지출을 카테고리별로 합산해서 내려줌
@Getter
@Builder
public class CategoryStatsResponse {

    private boolean success;
    private List<CategoryData> statistics; // 카테고리별 데이터 목록 (도넛 조각 하나 = 한 카테고리)

    // 각 카테고리의 데이터 (도넛 조각 하나에 해당)
    @Getter
    @Builder
    public static class CategoryData {
        private String category; // 카테고리명 (회의/IT_인프라/행사/교육/식비/디자인/기타)
        private Long amount;     // 그 카테고리의 이번 달 승인 지출 합계
    }
}
