package com.example.backend.global.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component // Spring이 자동으로 Bean 등록해줌. 다른 클래스에서 주입받아 쓸 수 있음
public class JwtProvider {

                                // @Value는 application.properties 에서 가져온거
    @Value("${jwt.secret}")    // (프로포티즈는 텍스트 파일이여서 Java가 직접 읽을수가 없어서 sping이 대신 읽으러 @Value로 주입)
    private String secretKey; // 프로포티즈에서 jwt.secret을 찾아서 secretKey에 넣어줌
                                // 토큰 서명에 쓰는 비밀키

    @Value("${jwt.expiration}") // 프로포티즈에서 jwt.expiration에서 키값을 가져와서 expiration에 넣음
    private long expiration;    // 토큰 만료 시간
                                // long이라서 밀리초 형테
                                // 86400000ms = 86400초 = 1440분 = 24시간

    // 토큰 생성
    public String generateToken(String email, String role) { // 로그인한 사용자 이메일 받고, 권한 받음(user등등), 완성된 토큰 문자열 반환
        return Jwts.builder() // jjwt 라이브러리의 JWT 빌더 시작 (재료 하나씩 넣고 마지막에 완성하는 방식)
                .subject(email) // 토큰 주인이 누구인지 저장(email)로 되어있으니깐 나중에 getEmail로 꺼낼 수 있음
                .claim("role", role) // 추가로 데이터 저장하는거 role이라는 키로 권한값 저장 나중에 getRole로 꺼낼 수 있음
                .issuedAt(new Date())   // 발급시간 = 현재시간
                .expiration(new Date(System.currentTimeMillis() + expiration)) // System.currentTimeMillis() 지금시간(밀리초)
                // + expiration 은 추가할 밀리초 지금 expiration에다가 24시간으로 유효기간 설정해놔서 현재시간 24시간후에 만료된다~
                // 그리고 new Date가 날짜 객체로 변환
                .signWith(getSecretKey()) // 비밀키로 서명 (이 서명때문에 토큰 위조 불가~)
                .compact(); // 위에 있는 모든 기능들 합쳐서 토큰으로 변환
    }

    // 토큰에서 이메일 꺼내기
    public String getEmail(String token) {
        return getClaims(token).getSubject(); // getClaims(token)으로 토큰 파싱해서 데이터 꺼내는데 getSubject()로 해서 위에서
                                                // 토큰 주인 지정해놓은 이메일을 꺼내옴
    }

    // 토큰에서 권한 꺼내기
    public String getRole(String token) {
        return getClaims(token).get("role", String.class); // 이것도 마찬가지로 토큰에서 role을 꺼내고 user, admin 뭔지 확인하기 위해서
    }

    // 토큰 유효성 검증 (유효한 토큰인지 검증)
    public boolean validateToken(String token) {
        try {
            getClaims(token); // 토큰 파싱시도
            return true;        // 성공하면 유효한 토큰
        } catch (Exception e) {
            return false;       // 실패하면 유효하지 않은 토큰 (실패하는경우 유효시간 지난경우, 누군가 토큰 수정함, 비밀키 다름)
        }
    }

    // Claims 꺼내기
    private Claims getClaims(String token) {
        return Jwts.parser()    // 토큰 읽기 시작~
                .verifyWith(getSecretKey()) // 비밀키로 서명 검증 (읽을때도 같은 비밀키로 서명 검증), 비밀키 다르거나 토큰 변조됐으면 여기서 에러
                .build() // 위에 generateToken()에서 .compact() 쓴거와 같은 느낌 이것도 parser 만들어줘~
                .parseSignedClaims(token) // 토큰을 Header, Payload, Signature로 쪼개는것
                .getPayload();  // 분해된 토큰에서 데이터만 가져오기
    }

    // SecretKey 생성
    private SecretKey getSecretKey() { // 프로포티즈에서 가져온 문자열 비밀키
        return Keys.hmacShaKeyFor(secretKey.getBytes()); // getBytes() 문자열을 바이트로 변환
                                                            // Keys.hmacShaKeyFor 바이트 배열을 JWT가 쓸 수 있는 SecretKey 객체로 변환
    }                                                       // JWT 라이브러리는 문자열 그대로 못쓰고 SecretKey 객체 형태로 줘야함
}