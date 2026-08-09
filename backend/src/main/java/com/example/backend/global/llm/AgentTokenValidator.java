package com.example.backend.global.llm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Agent 서비스 토큰 검증 공용 부품.
 *
 * LLM이 우리 백엔드를 부를 때(콜백 CB-001, 내부 조회 API BE-001~)는 JWT 로그인이 아니라
 * Authorization: Bearer <agent.service-token> 을 붙여 보낸다. 그 토큰이 맞는지 여기서 확인한다.
 * (콜백 컨트롤러·내부 API 컨트롤러가 같은 로직을 쓰도록 한 곳에 모음)
 */
@Component
public class AgentTokenValidator {

    private final String agentServiceToken;

    public AgentTokenValidator(@Value("${agent.service-token}") String agentServiceToken) {
        this.agentServiceToken = agentServiceToken;
    }

    // 유효하지 않으면 AgentUnauthorizedException(→ 401) 을 던짐
    public void verify(String authorizationHeader) {
        if (!isValid(authorizationHeader)) {
            throw new AgentUnauthorizedException("유효하지 않은 Agent 서비스 토큰입니다.");
        }
    }

    public boolean isValid(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return false;
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();
        return agentServiceToken != null
                && !agentServiceToken.isBlank()
                && agentServiceToken.equals(token);
    }
}
