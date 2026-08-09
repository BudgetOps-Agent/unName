package com.example.backend.budget.repository;

import com.example.backend.budget.dto.BudgetInsightsResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;

/**
 * AI 예산 인사이트(LLM-016) 결과 캐시 — Redis
 *
 * LLM-016은 잡 방식이라 생성에 수 초 걸리고 매번 부르면 비용도 든다.
 * 그래서 팀+기간별로 결과를 Redis에 저장해두고, 화면은 저장된 값을 바로 보여준다.
 * (JWT RefreshTokenRepository와 동일한 StringRedisTemplate 패턴)
 */
@Slf4j
@Repository
public class BudgetInsightsCacheRepository {

    private final StringRedisTemplate redisTemplate;

    // JSON 직렬화용. 스프링 빈 주입 대신 직접 생성 —
    // 이 프로젝트엔 ObjectMapper 빈이 자동등록돼 있지 않아서(주입 시 기동 실패).
    // 상태 없는 스레드세이프 객체라 하나 만들어 재사용해도 안전.
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 캐시 유효기간 6시간 (지출 변동 반영 텀 — 필요하면 조정)
    private static final Duration TTL = Duration.ofHours(6);

    public BudgetInsightsCacheRepository(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private String key(Long teamId, String period) {
        return "budget-insights:" + teamId + ":" + period;
    }

    /** 캐시에서 인사이트 꺼내기. 없거나 역직렬화 실패면 null */
    public BudgetInsightsResponse.Insights find(Long teamId, String period) {
        String json = redisTemplate.opsForValue().get(key(teamId, period));
        if (json == null) {
            return null;
        }
        try {
            return objectMapper.readValue(json, BudgetInsightsResponse.Insights.class);
        } catch (Exception e) {
            // 포맷 안 맞으면 캐시 무시하고 새로 생성하게 둠 (에러로 화면 막지 않음)
            log.warn("[LLM-016] 예산 인사이트 캐시 역직렬화 실패 - teamId={}, period={}", teamId, period, e);
            return null;
        }
    }

    /** 인사이트를 캐시에 저장 (6시간 TTL) */
    public void save(Long teamId, String period, BudgetInsightsResponse.Insights insights) {
        try {
            String json = objectMapper.writeValueAsString(insights);
            redisTemplate.opsForValue().set(key(teamId, period), json, TTL);
        } catch (Exception e) {
            // 캐시 저장 실패해도 이번 응답은 이미 만들어졌으니 화면엔 영향 없음 (로그만)
            log.warn("[LLM-016] 예산 인사이트 캐시 저장 실패 - teamId={}, period={}", teamId, period, e);
        }
    }
}
