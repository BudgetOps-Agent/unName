package com.example.backend.global.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

// JWT 인증 필터
// 모든 요청마다 JWT 토큰을 검증하는 필터
@RequiredArgsConstructor // Lombok이 생성자 자동으로 만들어줌 JwtProvider 주입 받을때 필요함
public class JwtAuthenticationFilter extends OncePerRequestFilter { // OncePerRequestFilter = 요청당 딱 한 번만 실행되는 필터

    // 토큰 검증에 사용할 JwtProvider 주입
    private final JwtProvider jwtProvider;
    private final TokenBlacklistRepository tokenBlacklistRepository;

    @Override // 실제로 필터가 실행될 때 호출되는 메서드
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 요청 헤더에서 토큰 꺼내기
        // resolveToken()이 처리해줌
        // Authorization: Bearer {token} 형식에서 토큰만 추출
        String token = resolveToken(request);

        // 토큰이 있고 유효하면 인증 처리
        if (token != null && jwtProvider.validateToken(token) && !tokenBlacklistRepository.isBlacklisted(token)) {

            // 토큰에서 이메일, 권한 꺼내기
            String email = jwtProvider.getEmail(token);
            String role = jwtProvider.getRole(token);

            //  Spring Security 인증 객체 생성
            // UsernamePasswordAuthenticationToken = 인증된 사용자 정보 담는 객체
            // 첫번째 인자 = 누구인지 (email)
            // 두번째 인자 = 비밀번호 (토큰 방식에서는 null)
            // 세번째 인자 = 권한 목록
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role)) // 권한 리스트 목록 ROLE_USER 이런식으로 만드는것
                    );

            // SecurityContext에 인증 정보 저장 (SecurityConfig에 인증 객체 저장)
            // 그다음에 Controller에서 누가 요청했는지 꺼내 쓸 수 있음
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 다음 필터로 넘기기 (토큰 없어도 일단 넘김, 인증 필요한 URL은 Security가 막음)
        filterChain.doFilter(request, response);
    }

    // Authorization 헤더에서 토큰만 추출하는 메서드
    // Bearer 어쩌구 뒤에 토큰 Authorization 값 꺼내기
    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7); // "Bearer " 7글자 제거(띄어쓰기까지 7글자 제거하고 뒤에 토큰 값만 꺼낼려고)
        }

        if(request.getCookies() != null) {
            for(Cookie cookie : request.getCookies()) {
                if("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null; // 토큰 없으면 null 반환
    }
}