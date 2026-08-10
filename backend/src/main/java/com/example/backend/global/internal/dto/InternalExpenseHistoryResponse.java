package com.example.backend.global.internal.dto;

import lombok.Builder;
import lombok.Getter;

// BE-009 지출 이력 조회 (LLM용) 응답 항목
// 정산 리포트·주간 브리핑·예산 배분·대시보드 요약(LLM-016/017)에서 기간 지출 집계용
// 응답은 이 항목의 배열: [{ title, amount, category, date, status }]
@Getter
@Builder
public class InternalExpenseHistoryResponse {
    private String title;     // 지출 제목
    private Long amount;      // 금액
    private String category;  // 카테고리(enum 이름) — 심사 전이면 null
    private String date;      // 지출 발생일 (YYYY-MM-DD)
    private String status;    // 처리 상태 (SUBMITTED/ESCALATED/APPROVED/REJECTED)
}
