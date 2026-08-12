package com.example.backend.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

// AI 대시보드 요약 (API-024) 응답 DTO
// 메인 대시보드 "AI 요약" 카드에 그대로 띄울 문구
@Getter
@Builder
public class AiSummaryResponse {

    private boolean success;
    private String summary;    // 화면에 띄울 요약 문구 (LLM-017의 message)
    private Boolean verified;  // 수치 대조 통과 여부. false면 프론트가 '확인 필요' 표시 권장
}
