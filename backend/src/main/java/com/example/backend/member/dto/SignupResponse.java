// 회원가입 결과를 반환하는 DTO

// 1. package
package com.example.backend.member.dto;

// 2. import
import com.example.backend.member.entity.User;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;
import java.time.LocalDateTime;

// 3. 클래스 어노테이션
// @Builder
@Getter
@Builder
public class SignupResponse { // 4. 클래스 선언

    // 5. 응답 필드
    // success
    // user
    private boolean success;
    private UserResponse user;

    @Getter
    @Builder
    public static class UserResponse {

        // 6. 내부 DTO
        // UserResponse
        private Long id;
        private String name;
        private String email;
        private String role;
        private String phone;
        private LocalDate birthDate;
        private LocalDateTime createdAt;

        public static UserResponse fromEntity(User user) {
            return UserResponse.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .phone(user.getPhone())
                    .birthDate(user.getBirthDate())
                    .createdAt(user.getCreatedAt())
                    .build();
        }
    }
}
/**
 * 회원가입 응답 처리 흐름
 *
 * 회원가입 요청
 * ↓
 * UserService 실행
 * ↓
 * 회원 저장
 * ↓
 * SignupResponse 생성
 * ↓
 * Controller 반환
 * ↓
 * JSON 응답
 * ↓
 * 프론트 전달
 */