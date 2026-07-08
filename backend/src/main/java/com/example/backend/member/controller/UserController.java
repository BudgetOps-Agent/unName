// 프론트 요청을 받아 Service에게 전달하는 역할

// 1. package
package com.example.backend.member.controller;

// 2. import
import com.example.backend.global.exception.ErrorResponse;
import com.example.backend.member.dto.*;
import com.example.backend.member.service.UserService;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

// 3. 클래스 어노테이션
//   @RestController
//   @RequestMapping
//   @RequiredArgsConstructor
@RestController // JSON 반환하는 REST API 컨트롤러 (메서드 반환 값을 자동으로 JSON으로 변환해줌), @Controller랑 @ResponseBody 합친거
@RequestMapping("/api/user") // 기본 URL경로
@RequiredArgsConstructor
public class UserController {// 4. 클래스 선언
    // 5. Service 주입
    private final UserService userService;

    // 6. 회원가입 API
    @Operation(summary = "회원가입", description = "신규 회원을 등록합니다.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "회원가입 성공"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "입력값 오류",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "code": "INVALID_BIRTH_DATE",
                          "message": "올바른 생년월일을 입력해주세요."
                        }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "409",
            description = "회원 정보 중복",
            content = @Content(
                mediaType = "application/json",
                examples = {
                    @ExampleObject(
                        name = "이메일 중복",
                        value = """
                            {
                              "success": false,
                              "code": "DUPLICATE_EMAIL",
                              "message": "이미 존재하는 이메일입니다."
                            }
                        """
                    ),
                    @ExampleObject(
                        name = "전화번호 중복",
                        value = """
                            {
                              "success": false,
                              "code": "DUPLICATE_PHONE",
                              "message": "이미 사용 중인 전화번호입니다."
                            }
                        """
                    )
                }
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "서버 내부 오류",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "code": "INTERNAL_SERVER_ERROR",
                          "message": "서버 내부 오류가 발생했습니다."
                        }
                    """
                )
            )
        )
    })
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

    @PostMapping("/findid")
    public ResponseEntity<FindIdResponse> findId(@RequestBody @Valid FindIdRequest request) {
        FindIdResponse response = userService.findId(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-user")
    public ResponseEntity<VerifyUserResponse> verifyUser(@RequestBody @Valid VerifyUserRequest request) {
        VerifyUserResponse response = userService.verifyUser(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ResetPasswordResponse> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        ResetPasswordResponse response = userService.resetPassword(request);
        return ResponseEntity.ok(response);
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