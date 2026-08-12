package com.example.backend.policy.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

// AI 정책 추천(API-044) 응답용 DTO
// 마법사 회칙 단계의 "AI 초안 생성하기" 버튼에 대응
@Getter
@Builder
public class PolicyRecommendResponse {

    private boolean success;

    // AI가 만든 회칙 초안 (조항 단위, 각 항목이 완결된 조항 한 문장 — LLM팀 8/6 회신으로 확정)
    // LLM 응답의 rules[]를 그대로 내려줌 — 프론트가 편집창에 띄우고,
    // 저장은 API-031(policyType=TEXT)로 하면 됨
    private List<String> rules;

    // 추천 지출 카테고리 (전역 9종 고정)
    private List<String> recommendedCategories;

    // 참고 문구
    private String notes;
}
