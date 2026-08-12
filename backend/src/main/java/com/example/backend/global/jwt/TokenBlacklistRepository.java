package com.example.backend.global.jwt;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;

@Repository
public class TokenBlacklistRepository {
    private final StringRedisTemplate redisTemplate;

    public TokenBlacklistRepository(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private String key(String accessToken) {
        return "blacklist:" + accessToken;
    }

    public void add(String accessToken, Long ttlMillis) {
        redisTemplate.opsForValue().set(key(accessToken), "blacklist", Duration.ofMillis(ttlMillis));
    }

    public boolean isBlacklisted(String accessToken) {
        return redisTemplate.hasKey(key(accessToken));
    }
}
