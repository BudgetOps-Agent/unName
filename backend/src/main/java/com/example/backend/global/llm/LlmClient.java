package com.example.backend.global.llm;

import com.example.backend.global.llm.dto.AnalyzeRequest;
import com.example.backend.global.llm.dto.BudgetInsightsRequest;
import com.example.backend.global.llm.dto.BudgetInsightsResult;
import com.example.backend.global.llm.dto.ContextRefreshRequest;
import com.example.backend.global.llm.dto.DashboardSummaryRequest;
import com.example.backend.global.llm.dto.DashboardSummaryResponse;
import com.example.backend.global.llm.dto.JobAcceptedResponse;
import com.example.backend.global.llm.dto.JobResultResponse;
import com.example.backend.global.llm.dto.PolicyDraftRequest;
import com.example.backend.global.llm.dto.PolicyDraftResponse;
import com.example.backend.global.llm.dto.PrecedentRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;

/**
 * LLM(Agent) 서버를 부르는 담당 부품.
 *
 * 서버 주소·토큰이 바뀌거나 통신 방식이 바뀌어도 이 클래스 안만 고치면 되도록 따로 뺐음.
 * (PolicyService는 "policyDraft() 부르면 초안이 온다"만 알면 됨)
 *
 * WebClient(webflux)를 안 쓰고 RestClient를 쓰는 이유:
 * LLM-005는 동기 200 응답이라 비동기가 필요 없고,
 * RestClient는 spring-web에 기본으로 들어있어서 의존성을 추가 안 해도 됨.
 */
@Slf4j
@Component
public class LlmClient {

    private final RestClient restClient;

    public LlmClient(
            @Value("${llm.base-url}") String baseUrl,
            @Value("${llm.service-token}") String serviceToken,
            @Value("${llm.timeout-seconds}") int timeoutSeconds
    ) {
        // 타임아웃 설정 — 안 걸어두면 LLM이 안 죽고 매달려 있을 때 우리 스레드도 같이 묶임
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                // 모든 요청에 서비스 토큰 자동으로 붙임 (LLM 명세 공통 규약)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + serviceToken)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .requestFactory(factory)
                .build();
    }

    /**
     * LLM-005 AI 마법사 통합 요청
     * POST /v1/policy-draft — 동기 응답(200)
     *
     * rule_source=ai면 응답 rules[]에 회칙 초안이 담겨 오고,
     * 그 외(file/manual/skip)면 rules[]는 빈 배열로 온다.
     */
    public PolicyDraftResponse policyDraft(PolicyDraftRequest request) {

        log.info("[LLM-005] 요청 - teamId={}, ruleSource={}",
                request.getTeamId(), request.getRuleSource());

        try {
            PolicyDraftResponse response = restClient.post()
                    .uri("/v1/policy-draft")
                    .body(request)
                    .retrieve()
                    .body(PolicyDraftResponse.class);

            log.info("[LLM-005] 응답 - teamId={}, rules={}건",
                    request.getTeamId(),
                    response != null && response.getRules() != null ? response.getRules().size() : 0);

            return response;

        } catch (RestClientException e) {
            // 연결 실패·타임아웃·4xx·5xx 전부 여기로 들어옴.
            // 원인은 로그로만 남기고, 사용자에겐 LlmErrorCode의 안내 문구만 나감
            log.error("[LLM-005] 호출 실패 - teamId={}", request.getTeamId(), e);
            throw new LlmException(LlmErrorCode.LLM_SERVER_ERROR, e);
        }
    }

    /**
     * LLM-007 판례 저장
     * POST /v1/precedents — 관리자의 승인/반려 결정을 판례로 적재
     *
     * ★ 실패해도 예외를 던지지 않는다.
     * 판례 저장은 부가 기능이라, 여기서 실패했다고 사용자의 승인/반려 처리(이미 커밋됨)를
     * 막거나 롤백시키면 안 된다. 실패는 로그로만 남기고 조용히 넘어간다.
     */
    public void savePrecedent(PrecedentRequest request) {

        log.info("[LLM-007] 판례 저장 요청 - expenseId={}, decision={}, isOverride={}",
                request.getExpenseId(), request.getDecision(), request.getIsOverride());

        try {
            restClient.post()
                    .uri("/v1/precedents")
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientException e) {
            log.warn("[LLM-007] 판례 저장 실패 (승인/반려 자체는 정상 처리됨) - expenseId={}",
                    request.getExpenseId(), e);
        }
    }

    /**
     * LLM-003 AI 지출 심사 요청
     * POST /v1/analyze — 202 접수. 결과는 CB-001 콜백으로 나중에 발신됨
     *
     * ★ 실패해도 예외를 던지지 않는다.
     * 심사 요청은 지출 등록의 부가 동작이라, 여기서 실패했다고 사용자의 지출 등록(이미 저장됨)을
     * 막거나 롤백시키면 안 된다. 실패 시 지출은 SUBMITTED로 남고, 실패는 로그로만 남긴다.
     */
    public void analyze(AnalyzeRequest request) {

        log.info("[LLM-003] 심사 요청 - expenseId={}, jobId={}",
                request.getExpenseId(), request.getJobId());

        try {
            restClient.post()
                    .uri("/v1/analyze")
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientException e) {
            log.warn("[LLM-003] 심사 요청 실패 (지출 등록 자체는 정상 처리됨) - expenseId={}",
                    request.getExpenseId(), e);
        }
    }

    /**
     * LLM-006 회칙 변경 알림
     * POST /v1/context/refresh — 202 접수. 원문은 LLM이 BE-005로 되물어 감(pull).
     *
     * ★ 실패해도 예외를 던지지 않는다 (analyze와 동일).
     * 재인덱싱 알림은 회칙 저장의 부가 동작이라, 여기서 실패했다고 사용자의 회칙 저장(이미 저장됨)을
     * 막거나 롤백시키면 안 된다. 실패는 로그로만 남긴다.
     * (인덱싱 완료 확인이 필요하면 응답 job_id를 LLM-004로 폴링하면 되지만, 저장 흐름은 안 막음)
     */
    public void contextRefresh(ContextRefreshRequest request) {

        log.info("[LLM-006] 회칙 변경 알림 - teamId={}, changeType={}",
                request.getTeamId(), request.getChangeType());

        try {
            restClient.post()
                    .uri("/v1/context/refresh")
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();

        } catch (RestClientException e) {
            log.warn("[LLM-006] 회칙 변경 알림 실패 (회칙 저장 자체는 정상 처리됨) - teamId={}",
                    request.getTeamId(), e);
        }
    }

    /**
     * LLM-017 대시보드 AI 요약
     * POST /v1/dashboard/summary — 동기 200 응답 (LLM-005와 같은 방식)
     *
     * 대시보드 요약은 화면에 바로 보여줘야 하는 값이라 동기로 받는다.
     * 실패 시 LlmException(502/503)을 던짐 — 이 API(API-024)는 대시보드 본체(API-023)와
     * 별개 호출이라, 요약만 실패하고 대시보드 자체는 정상 동작한다.
     */
    public DashboardSummaryResponse dashboardSummary(DashboardSummaryRequest request) {

        log.info("[LLM-017] 대시보드 요약 요청 - teamId={}", request.getTeamId());

        try {
            return restClient.post()
                    .uri("/v1/dashboard/summary")
                    .body(request)
                    .retrieve()
                    .body(DashboardSummaryResponse.class);

        } catch (RestClientException e) {
            log.error("[LLM-017] 호출 실패 - teamId={}", request.getTeamId(), e);
            throw new LlmException(LlmErrorCode.LLM_SERVER_ERROR, e);
        }
    }

    // ── LLM-016 예산 인사이트 (잡 방식) ────────────────────────────────
    // 폴링 파라미터: 1.5초 간격 × 최대 20회 = 최대 약 30초.
    // (nginx read timeout 60초 안쪽. 무거운 생성이라 대시보드 요약보다 여유를 둠)
    private static final long POLL_INTERVAL_MS = 1500L;
    private static final int POLL_MAX_ATTEMPTS = 20;

    /**
     * LLM-016 예산 관리 AI 메시지 — 접수 + 폴링을 한 번에 처리하는 블로킹 호출.
     * POST /v1/budget-insights 로 잡을 접수(202)한 뒤,
     * LLM-004(GET /v1/jobs/{job_id})를 succeeded 될 때까지 폴링해서 결과를 반환한다.
     *
     * 화면(API-052)이 캐시 미스일 때 이 메서드로 생성한다. (첫 호출만 수 초 소요)
     * 실패·타임아웃 시 LlmException(502)을 던짐 → 서비스가 잡아 화면에 '실패'로 표시.
     */
    public BudgetInsightsResult budgetInsights(BudgetInsightsRequest request) {

        log.info("[LLM-016] 예산 인사이트 요청 - teamId={}, period={}",
                request.getTeamId(), request.getPeriod());

        // 1) 잡 접수 (202 → job_id)
        JobAcceptedResponse accepted;
        try {
            accepted = restClient.post()
                    .uri("/v1/budget-insights")
                    .body(request)
                    .retrieve()
                    .body(JobAcceptedResponse.class);
        } catch (RestClientException e) {
            log.error("[LLM-016] 접수 실패 - teamId={}", request.getTeamId(), e);
            throw new LlmException(LlmErrorCode.LLM_SERVER_ERROR, e);
        }

        if (accepted == null || accepted.getJobId() == null) {
            log.error("[LLM-016] 접수 응답에 job_id 없음 - teamId={}", request.getTeamId());
            throw new LlmException(LlmErrorCode.LLM_SERVER_ERROR);
        }

        // 2) LLM-004 폴링 (succeeded 될 때까지)
        String jobId = accepted.getJobId();
        for (int attempt = 1; attempt <= POLL_MAX_ATTEMPTS; attempt++) {
            try {
                Thread.sleep(POLL_INTERVAL_MS);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new LlmException(LlmErrorCode.LLM_SERVER_ERROR, ie);
            }

            JobResultResponse job = getJobResult(jobId);
            if (job == null) {
                continue; // 일시적 문제로 보고 다음 시도
            }
            if (job.isSucceeded()) {
                log.info("[LLM-016] 완료 - teamId={}, jobId={}, attempts={}",
                        request.getTeamId(), jobId, attempt);
                return job.getResult();
            }
            if (job.isFailed()) {
                log.error("[LLM-016] 잡 실패 - teamId={}, jobId={}, status={}",
                        request.getTeamId(), jobId, job.getStatus());
                throw new LlmException(LlmErrorCode.LLM_SERVER_ERROR);
            }
            // queued/running 이면 계속 폴링
        }

        // 시간 안에 안 끝남
        log.error("[LLM-016] 폴링 타임아웃 - teamId={}, jobId={}", request.getTeamId(), jobId);
        throw new LlmException(LlmErrorCode.LLM_SERVER_ERROR);
    }

    /**
     * LLM-004 심사/잡 상태·결과 조회
     * GET /v1/jobs/{job_id}
     * 폴링 안전망 — 콜백/잡 결과를 job_id로 되물어 온다.
     */
    public JobResultResponse getJobResult(String jobId) {
        try {
            return restClient.get()
                    .uri("/v1/jobs/{jobId}", jobId)
                    .retrieve()
                    .body(JobResultResponse.class);
        } catch (RestClientException e) {
            // 폴링 중 일시적 실패는 상위(루프)에서 재시도하도록 null 반환
            log.warn("[LLM-004] 잡 조회 실패 - jobId={}", jobId, e);
            return null;
        }
    }
}
