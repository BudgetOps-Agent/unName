// 회원 관련 에러 코드를 관리

// 1. package
package com.example.backend.member.exception;

// 2. import
import org.springframework.http.HttpStatus;

// 3. enum 선언
// MemberErrorCode

// public enum MemberErrorCode {

    // 4. 에러 코드 목록
    // MEMBER_NOT_FOUND
    // DUPLICATE_USER_ID
    // DUPLICATE_EMAIL

    // 5. 상태코드
    // HttpStatus

    // 6. 에러 메시지
    // message

    // 7. 생성자

    // 8. Getter
// }

/**
 * MemberErrorCode 역할
 *
 * 회원 관련 에러를 관리한다.
 *
 * 사용 예시
 *
 * 아이디 중복
 * ↓
 * DUPLICATE_USER_ID
 *
 * 이메일 중복
 * ↓
 * DUPLICATE_EMAIL
 *
 * 회원 없음
 * ↓
 * MEMBER_NOT_FOUND
 *
 * 처리 순서
 *
 * Service
 * ↓
 * 에러 발생
 * ↓
 * MemberErrorCode 선택
 * ↓
 * MemberException 전달
 */

public enum MemberErrorCode {

    MEMBER_NOT_FOUND(
            HttpStatus.UNAUTHORIZED,
            "이메일 또는 비밀번호가 일치하지 않습니다."
    ),

//    DUPLICATE_USER_ID(
//            HttpStatus.CONFLICT,
//            "이미 존재하는 아이디입니다."
//    ),

    USER_NOT_FOUND(
            HttpStatus.NOT_FOUND,
            "사용자를 찾을 수 없습니다."
    ),

    DUPLICATE_EMAIL(
            HttpStatus.CONFLICT,
            "이미 존재하는 이메일입니다."
    ),

    DUPLICATE_PHONE(
            HttpStatus.CONFLICT,
    "이미 사용 중인 전화번호입니다."
    ),

    INVALID_BIRTH_DATE(
            HttpStatus.BAD_REQUEST,
            "올바른 생년월일을 입력해주세요."
    ),

    INVALID_REFRESH_TOKEN(
        HttpStatus.UNAUTHORIZED, // 401
            "토큰 재발급이 불가합니다."
    ),

    REUSED_REFRESH_TOKEN(
            HttpStatus.UNAUTHORIZED, // 401
            "보안을 위해 다시 로그인해주세요"
    ),

    INACTIVE_MEMBER(
            HttpStatus.UNAUTHORIZED,
            "비활성화된 계정입니다. 관리자에게 문의해주세요."
    );

//    INVALID_PASSWORD(
//            HttpStatus.UNAUTHORIZED,
//    "비밀번호가 일치하지 않습니다."
//    );

    private final HttpStatus status;
    private final String message;

    MemberErrorCode(
            HttpStatus status,
            String message
    ) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}