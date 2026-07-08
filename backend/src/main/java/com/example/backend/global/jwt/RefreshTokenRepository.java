package com.example.backend.global.jwt;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;

@Repository
public class RefreshTokenRepository {
    private final StringRedisTemplate redisTemplate;

    // 생성자
    public RefreshTokenRepository(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private String key(String userEmail) {
            return "refresh:" + userEmail;
    }

    public void save(String userEmail, String refreshToken) {
        redisTemplate.opsForValue().set(key(userEmail), refreshToken, Duration.ofDays(14));
    }

    public String find(String userEmail) {
        return redisTemplate.opsForValue().get(key(userEmail));
    }

    public void delete(String userEmail) {
        redisTemplate.delete(key(userEmail));
    }
}
