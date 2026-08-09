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
 * ※ 지금은 예산 인사이트(LLM-016) 폴링에만 쓰므로 result 를 BudgetInsightsResult 로 둔다.
 *    다른 잡 종류에도 재사용하게 되면 그때 제네릭/분리 고려.
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
    private BudgetInsightsResult result;

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
