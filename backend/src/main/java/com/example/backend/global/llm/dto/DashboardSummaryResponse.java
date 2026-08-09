package com.example.backend.global.llm.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * LLM-017 대시보드 AI 요약 응답 바디 (LLM → 백엔드)
 *
 * message  : 화면에 그대로 띄울 2~4문장 (필드명이 summary가 아니라 message)
 * figures  : 문장이 어떤 집계에서 나왔는지 대조용 재료 (스키마 미확정 → Object)
 * verified : 본문 수치와 집계값 대조 통과 여부. false면 화면에 '확인 필요' 표시
 */
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DashboardSummaryResponse {

    private String message;
    private Object figures;
    private Boolean verified;
}
