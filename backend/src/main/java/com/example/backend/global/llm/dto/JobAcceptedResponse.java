package com.example.backend.global.llm.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 비동기 잡 접수 응답 바디 (LLM → 백엔드)
 * LLM-016(예산 인사이트) 등 202 접수 API들의 공통 응답.
 *
 * job_id 를 LLM-004(GET /v1/jobs/{job_id})로 폴링해서 결과를 받는다.
 */
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class JobAcceptedResponse {

    @JsonProperty("job_id")
    private String jobId;

    @JsonProperty("external_job_id")
    private String externalJobId;

    // queued / running / ... (접수 직후라 보통 queued)
    @JsonProperty("status")
    private String status;
}
