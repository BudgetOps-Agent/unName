// 프론트 요청을 받아 Service에게 전달하는 역할

// 1. package
package com.example.backend.member.controller;

// 2. import


// 3. 클래스 어노테이션
//   @RestController
//   @RequestMapping
//   @RequiredArgsConstructor

import com.example.backend.member.dto.LoginRequest;
import com.example.backend.member.dto.LoginResponse;
import com.example.backend.member.dto.SignupRequest;
import com.example.backend.member.dto.SignupResponse;
import com.example.backend.member.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // JSON 반환하는 REST API 컨트롤러 (메서드 반환 값을 자동으로 JSON으로 변환해줌), @Controller랑 @ResponseBody 합친거
@RequestMapping("/api/user") // 기본 URL경로
@RequiredArgsConstructor
public class UserController {// 4. 클래스 선언
    // 5. Service 주입
    private final UserService userService;

    // 6. 회원가입 API
    // @RequestBody JSON 객체로 변환
    // @Valid 검증(빈칸인지, 이메일 형식인지 등등)
    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@RequestBody @Valid SignupRequest request) {
        SignupResponse response = userService.signup(request);
        return ResponseEntity.status(201).body(response);
    }

    // 로그인 API
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(response); // ok가 자동으로 200코드를 보내서 명시적으로 안써도 됨
    }

    // 6. API 메서드들
    // - signup()
    // - login()
    // - findUser()
    // - updateUser()

    // 7. private 메서드 (있다면)
}

/**
 * 회원가입 처리 흐름
 *
 * 요청 받기
 * ↓
 * 요청 검증
 * ↓
 * Service 호출
 * ↓
 * 회원 저장
 * ↓
 * 응답 반환
 */