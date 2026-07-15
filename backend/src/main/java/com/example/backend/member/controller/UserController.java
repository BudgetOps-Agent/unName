// 프론트 요청을 받아 Service에게 전달하는 역할

// 1. package
package com.example.backend.member.controller;

// 2. import
import com.example.backend.global.exception.ErrorResponse;
import com.example.backend.global.jwt.JwtProvider;
import com.example.backend.global.jwt.RefreshTokenRepository;
import com.example.backend.member.dto.*;
import com.example.backend.member.entity.User;
import com.example.backend.member.exception.MemberErrorCode;
import com.example.backend.member.exception.MemberException;
import com.example.backend.member.repository.UserRepository;
import com.example.backend.member.service.UserService;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.time.Duration;

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
    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    // 6. 스웨거 API
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
                schema = @Schema(implementation = ErrorResponse.class),
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
                schema = @Schema(implementation = ErrorResponse.class),
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
                schema = @Schema(implementation = ErrorResponse.class),
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
    @Operation(summary = "로그인", description = "이메일과 비밀번호를 이용하여 로그인합니다.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "로그인 성공"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "입력값 오류",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                        value = """
                {
                  "success": false,
                  "code": "BAD_REQUEST",
                  "message": "요청 형식이 올바르지 않습니다."
                }
                """
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "로그인 실패",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = {
                    @ExampleObject(
                            name = "이메일 또는 비밀번호 불일치",
                            value = """
                    {
                      "success": false,
                      "code": "MEMBER_NOT_FOUND",
                      "message": "이메일 또는 비밀번호가 일치하지 않습니다."
                    }
                    """
                    ),
                    @ExampleObject(
                            name = "비활성화 계정",
                            value = """
                    {
                      "success": false,
                      "code": "INACTIVE_MEMBER",
                      "message": "비활성화된 계정입니다. 관리자에게 문의해주세요."
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
                schema = @Schema(implementation = ErrorResponse.class),
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
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request, HttpServletResponse httpResponse) {
        LoginResult result = userService.login(request);

        String accessToken = result.getAccessToken();
        String refreshToken = result.getRefreshToken();

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ofMinutes(30))
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ofDays(14))
                .build();

        httpResponse.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(result.getResponse()); // ok가 자동으로 200코드를 보내서 명시적으로 안써도 됨
    }

    @Operation(summary = "토큰 재발급", description = "Refresh Token을 이용하여 Access Token과 Refresh Token을 재발급합니다.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "토큰 재발급 성공"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Refresh Token 인증 실패",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = {
                    @ExampleObject(
                        name = "유효하지 않은 Refresh Token",
                        value = """
                            {
                              "success": false,
                              "code": "INVALID_REFRESH_TOKEN",
                              "message": "토큰 재발급이 불가합니다."
                            }
                            """
                    ),
                    @ExampleObject(
                        name = "재사용된 Refresh Token",
                        value = """
                            {
                              "success": false,
                              "code": "REUSED_REFRESH_TOKEN",
                              "message": "보안을 위해 다시 로그인해주세요."
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
                schema = @Schema(implementation = ErrorResponse.class),
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
    @PostMapping("/reissue")
    public ResponseEntity<LoginResponse> reissue(@CookieValue("refreshToken") String refreshToken, HttpServletResponse httpResponse) {
        LoginResult result = userService.reissue(refreshToken);

        String newAccessToken = result.getAccessToken();
        String newRefreshToken = result.getRefreshToken();

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", newAccessToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ofMinutes(30))
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", newRefreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ofDays(14))
                .build();

        httpResponse.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(result.getResponse());
    }

    @Operation(summary = "아이디 찾기", description = "이름과 휴대폰 번호를 이용하여 회원의 이메일(아이디)을 조회합니다.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "아이디 찾기 성공"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "입력값 오류",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "code": "BAD_REQUEST",
                          "message": "요청 형식이 올바르지 않습니다."
                        }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "회원 정보 없음",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "code": "USER_NOT_FOUND",
                          "message": "사용자를 찾을 수 없습니다."
                        }
                    """
                )
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "서버 내부 오류",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
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
    @PostMapping("/findid")
    public ResponseEntity<FindIdResponse> findId(@RequestBody @Valid FindIdRequest request) {
        FindIdResponse response = userService.findId(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "회원 정보 확인", description = "이름과 이메일을 확인하여 비밀번호를 변경할 회원인지 검증합니다.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "회원 정보 확인 성공"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "입력값 오류",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "code": "BAD_REQUEST",
                          "message": "요청 형식이 올바르지 않습니다."
                        }
                        """
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "회원 정보 없음",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "code": "USER_NOT_FOUND",
                          "message": "사용자를 찾을 수 없습니다."
                        }
                        """
                )
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "서버 내부 오류",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
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
    @PostMapping("/verify-user")
    public ResponseEntity<VerifyUserResponse> verifyUser(@RequestBody @Valid VerifyUserRequest request) {
        VerifyUserResponse response = userService.verifyUser(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "비밀번호 변경", description = "회원의 비밀번호를 새로운 비밀번호로 변경합니다.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "비밀번호 변경 성공"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "입력값 오류",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "code": "BAD_REQUEST",
                          "message": "요청 형식이 올바르지 않습니다."
                        }
                        """
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "회원 정보 없음",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "code": "USER_NOT_FOUND",
                          "message": "사용자를 찾을 수 없습니다."
                        }
                        """
                )
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "서버 내부 오류",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
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
    @PostMapping("/reset-password")
    public ResponseEntity<ResetPasswordResponse> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
//        ResetPasswordResponse response = userService.resetPassword(request);
//        return ResponseEntity.ok(response);
        throw new RuntimeException("500 테스트");
    }
    // 6. API 메서드들
    // - signup()
    // - login()
    // - findUser()
    // - updateUser()

    @Operation(summary = "마이페이지 조회", description = "로그인한 회원의 정보를 조회합니다.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "회원 정보 조회 성공"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "인증 실패",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = {
                    @ExampleObject(
                            name = "유효하지 않은 Access Token",
                            value = """
                                {
                                  "success": false,
                                  "code": "INVALID_REFRESH_TOKEN",
                                  "message": "토큰 재발급이 불가합니다."
                                }
                                """
                    ),
                    @ExampleObject(
                        name = "비활성화 계정",
                        value = """
                            {
                              "success": false,
                              "code": "INACTIVE_MEMBER",
                              "message": "비활성화된 계정입니다. 관리자에게 문의해주세요."
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
                schema = @Schema(implementation = ErrorResponse.class),
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
    @GetMapping("/me")
    public ResponseEntity<MyPageResponse> getMyPage() {
        MyPageResponse response = userService.getMyPage();
        return ResponseEntity.ok(response);
    }
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