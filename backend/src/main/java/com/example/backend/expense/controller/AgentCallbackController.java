package com.example.backend.expense.controller;

import com.example.backend.expense.service.AgentCallbackService;
import com.example.backend.global.llm.dto.AgentCallbackRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/**
 * CB-001 심사 결과 콜백 수신 엔드포인트 (LLM 서버 → 백엔드)
 *
 * 이 엔드포인트는 로그인(JWT) 없이 열려 있고(SecurityConfig permitAll),
 * 대신 LLM이 붙여 보내는 Agent 서비스 토큰(Authorization: Bearer)을 여기서 직접 검증한다.
 * 응답은 본문 상관없이 2xx면 되므로 200 OK만 돌려준다.
 */
@Slf4j
@Tag(name = "AgentCallback", description = "LLM 심사 결과 콜백 수신 (CB-001)")
@RestController
@RequiredArgsConstructor
public class AgentCallbackController {

    private final AgentCallbackService agentCallbackService;

    // LLM이 우리 백엔드를 부를 때 붙이는 Agent 서비스 토큰 (LLM팀과 값 합의 필요)
    @Value("${agent.service-token}")
    private String agentServiceToken;

    @Operation(summary = "심사 결과 콜백 (CB-001)",
            description = "LLM 서버가 지출 심사 완료 시 결과를 보내는 내부 엔드포인트. "
                    + "Agent 서비스 토큰(Bearer)으로 인증하며, 결과로 지출 상태·카테고리·심사기록을 갱신한다.")
    @PostMapping("/agent-callback")
    public ResponseEntity<Void> handleCallback(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @RequestBody AgentCallbackRequest request
    ) {
        // Agent 서비스 토큰 검증 (Bearer <token>)
        if (!isValidAgentToken(authorization)) {
            log.warn("[CB-001] 콜백 인증 실패 expenseId={}", request.getExpenseId());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        agentCallbackService.handleCallback(request);
        return ResponseEntity.ok().build(); // 2xx면 됨
    }

    private boolean isValidAgentToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return false;
        }
        String token = authorization.substring("Bearer ".length()).trim();
        return agentServiceToken != null
                && !agentServiceToken.isBlank()
                && agentServiceToken.equals(token);
    }
}
