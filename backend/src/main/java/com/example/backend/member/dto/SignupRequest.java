// 회원가입 요청 데이터를 담는 DTO

// 1. package
package com.example.backend.member.dto;

// 2. import
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;

// 3. 클래스 어노테이션
@Getter
public class SignupRequest { // 4. 클래스 선언

    // 5. 검증 어노테이션
    @NotBlank(message = "아이디를 입력해주세요") // (공백/null)막아줌
    private String userId;
    @NotBlank(message = "비밀번호를 입력해주세요")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$",
            message = "비밀번호는 영문, 숫자를 포함하여 8자 이상이어야 합니다.")
    private String password;
    @NotBlank(message = "이메일을 입력해주세요")
    @Email(message = "유효한 이메일 형식이어야 합니다.(예: example@naver.com)") // 이메일 형식 검증하는것
    private String email;
    @NotBlank(message = "이름을 입력해주세요")
    private String name;
    private String birthDate;


    // 6. 요청 데이터 필드
    // userId
    // password
    // email
    // name
    // birthDate

    // 7. Getter
}

/**
 * SignupRequest 역할
 *
 * 프론트가 보낸 회원가입 데이터를 담는다.
 *
 * 예시
 *
 * {
 *   "userId": "tester",
 *   "password": "1234",
 *   "email": "test@test.com",
 *   "name": "홍길동",
 *   "birthDate": "2000-01-01"
 * }
 *
 * 처리 순서
 *
 * JSON 요청
 * ↓
 * SignupRequest 생성
 * ↓
 * Controller 전달
 * ↓
 * Service 전달
 */