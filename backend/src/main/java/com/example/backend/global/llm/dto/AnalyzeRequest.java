package com.example.backend.global.llm.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

/**
 * LLM-003 AI 지출 심사 요청 바디 (백엔드 → LLM)
 * POST /v1/analyze — 202 접수 후 결과는 CB-001 콜백으로 발신됨
 *
 * ⚠️ 이 요청과 콜백(CB-001)만 camelCase 규약을 씀 (그 외 LLM API는 snake_case)
 * 그래서 필드명을 camelCase 그대로 두면 Jackson 기본 직렬화로 camelCase JSON이 나감 (@JsonProperty 불필요)
 *
 * 지출 상세는 보내지 않음 — LLM이 BE-001로 되물어 가져가는 pull 모델
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AnalyzeRequest {

    private String jobId;          // 우리가 생성한 심사 작업 ID (UUID). 콜백 매칭용
    private Long expenseId;        // 심사 대상 지출 id
    private Long organizationId;   // 모임(팀) id
    private String reviewGoal;     // 심사 목표(선택) — 없으면 미전송
    private String receiptPath;    // LLM이 영수증을 가져갈 경로(BE-004로 GET). 파일 없으면 미전송
}
