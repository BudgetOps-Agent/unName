package com.example.backend.global.llm.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * CB-001 심사 결과 콜백 요청 바디 (LLM 서버 → 백엔드)
 *
 * ⚠️ 이 콜백과 심사요청(LLM-003)만 camelCase를 씀 (그 외 LLM API는 snake_case)
 * 심사가 끝나면 LLM 서버가 /agent-callback 으로 POST 발신 → 지출 상태/카테고리를 업데이트한다.
 *
 * 모르는 필드가 와도 안 터지게 ignoreUnknown = true
 * (opinions/mismatch 내부 스키마는 계약 문서 기준이라 우선 유연하게 Object로 받음)
 */
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AgentCallbackRequest {

    private String jobId;            // 심사요청 때 우리가 보낸 job_id (매칭용)
    private Long expenseId;          // 어떤 지출에 대한 결과인지
    private Long teamId;             // 모임 id
    private String verdict;          // 최종 판정 (approved/rejected/escalated 계열 — 매핑은 Service에서)
    private String suggestedCategory;// AI가 분류한 카테고리 (9종, 언더바 표기)
    private String processedBy;      // 처리 주체 (보통 "AI")
    private Double confidence;       // 신뢰도
    private List<Object> opinions;   // 심사관별 소견 (rule/budget/precedent/evidence)
    private List<Object> mismatch;   // 증빙 불일치 항목
    private Object reasons;          // 판정 근거 (문자열 또는 객체일 수 있어 Object)
    private Boolean dryRun;          // true면 시험용 — 실제 저장하지 않음
}
