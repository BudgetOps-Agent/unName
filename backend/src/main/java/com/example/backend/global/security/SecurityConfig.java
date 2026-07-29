package com.example.backend.global.security;

import com.example.backend.global.jwt.JwtAuthenticationFilter;
import com.example.backend.global.jwt.JwtProvider;
import com.example.backend.global.jwt.TokenBlacklistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// Spring Security 설정 클래스
@Configuration
@RequiredArgsConstructor // JwtProvider 생성자 주입
public class SecurityConfig {

    // JWT 토큰 검증에 사용할 JwtProvider 주입
    private final JwtProvider jwtProvider;
    private final TokenBlacklistRepository tokenBlacklistRepository;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // REST API 환경에서는 CSRF 비활성화
                .csrf(csrf -> csrf.disable())

                // CORS 허용 (프론트와 도메인이 다를 수 있으므로)
                .cors(Customizer.withDefaults())

                .authorizeHttpRequests(auth -> auth
                        // 아래 URL은 토큰 없이 누구나 접근 가능 (로그인 전 화면)
                        .requestMatchers(
                                "/api/user/signup",         // 회원가입
                                "/api/user/login",          // 로그인
                                "/api/user/findid",         // 아이디 찾기
                                "/api/user/verify-user",    // 유저 정보 확인
                                "/api/user/reset-password", // 비밀번호 재설정
                                "/api/user/reissue",
                                "/api/files/**",            // 영수증 조회(jpg,png,pdf)
                                "/swagger-ui/**",           // 스웨거 접속
                                "/swagger-ui.html",         // 스웨거 접속
                                "/v3/api-docs/**"           // api-docs

                        ).permitAll() // permitAll() 쓰면 누구나 접근 가능
                        // 나머지 모든 요청은 JWT 토큰 필요
                        .anyRequest().authenticated()
                )
                // JWT 필터를 Spring Security 필터 앞에 등록
                // 요청이 들어올 때마다 JWT 토큰 검증
                .addFilterBefore(new JwtAuthenticationFilter(jwtProvider, tokenBlacklistRepository),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}