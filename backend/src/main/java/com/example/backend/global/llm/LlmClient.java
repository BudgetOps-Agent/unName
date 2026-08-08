package com.example.backend.global.llm;

import com.example.backend.global.llm.dto.AnalyzeRequest;
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
}
