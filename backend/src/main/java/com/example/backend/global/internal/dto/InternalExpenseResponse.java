package com.example.backend.global.internal.dto;

import lombok.Builder;
import lombok.Getter;

// BE-001 지출 상세 조회 (LLM 심사용) 응답
// LLM이 심사 시작 시 pull 모델로 되물어 가져가는 지출 원본 정보
// category는 등록 시엔 null(AI가 콜백으로 채움) — 계약상 빈 값으로 내려감
@Getter
@Builder
public class InternalExpenseResponse {
    private String title;       // 지출 제목
    private Long amount;        // 금액
    private String category;    // 카테고리(enum 이름) — 심사 전이면 null
    private String date;        // 지출 발생일 (YYYY-MM-DD)
    private String description; // 설명
}
