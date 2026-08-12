package com.example.backend.global.llm.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * LLM-004 심사/잡 상태·결과 조회 응답 바디 (LLM → 백엔드)
 * GET /v1/jobs/{job_id}
 *
 * status 값: queued · running · succeeded · failed · dead(재시도 소진)
 * succeeded 면 result 에 결과가 담긴다.
 *
 * result는 잡 종류마다 모양이 달라서(예: 예산 인사이트는 {proposal_id, payload:{...}})
 * 고정 타입 대신 Object로 받는다. Spring이 이 응답 전체를 Jackson 3(tools.jackson.databind)로
 * 역직렬화하는데, result를 com.fasterxml.jackson.databind.JsonNode(구버전 Jackson 2 클래스)로
 * 두면 "Cannot construct instance of JsonNode" 예외가 남 — Jackson 3가 그 구버전 추상 타입을
 * 못 만듦. Object로 받으면 Jackson이 JSON 객체를 LinkedHashMap으로 담아주고, 호출부(LlmClient)가
 * 그 Map을 우리 쪽 구버전 ObjectMapper.convertValue()로 필요한 DTO에 매핑한다.
 * (LLM팀 로그 대조로 확인, 2026-08-12 — payload가 한 겹 더 있는 구조였음)
 */
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobResultResponse {

    @JsonProperty("job_id")
    private String jobId;

    @JsonProperty("status")
    private String status;

    @JsonProperty("attempts")
    private Integer attempts;

    @JsonProperty("result")
    private Object result;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;

    // ── status 판별 도우미 ────────────────────────────────
    public boolean isSucceeded() {
        return "succeeded".equalsIgnoreCase(status);
    }

    // 더 이상 기다려도 소용없는 종료 상태 (실패/사망)
    public boolean isFailed() {
        return "failed".equalsIgnoreCase(status) || "dead".equalsIgnoreCase(status);
    }
}
