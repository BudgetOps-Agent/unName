// 회원 관련 비즈니스 로직 처리

// 1. package
package com.example.backend.member.service;

// 2. import
import com.example.backend.member.dto.SignupRequest;
import com.example.backend.member.dto.SignupResponse;
import com.example.backend.member.entity.User;
import com.example.backend.member.exception.MemberErrorCode;
import com.example.backend.member.exception.MemberException;
import com.example.backend.member.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

// 3. 클래스 어노테이션
// @Service
// @RequiredArgsConstructor
@Service // 비즈니스 로직 담당한다고 알려주는 어노테이션 이걸 사용하면 Spring이 자동으로 Bean으로 등록해줌
@RequiredArgsConstructor // final 필드 생성자 자동 생성해주는 어노테이션 이걸 쓰면 생성자 직접 안써도 됨
public class UserService {// 4. 클래스 선언

    // 5. Repository 주입
    // UserRepository
    private final UserRepository userRepository;

    // 6. Bean 주입
    // PasswordEncoder
    private final PasswordEncoder passwordEncoder;

    // 7. 회원가입 메서드
    // signup()
    public SignupResponse signup(SignupRequest request) {

        // 아이디 중복 검사(DB에 같은 아이디가 있으면 이미 사용중인 아이디입니다 던지고 중단)
        if (userRepository.existsByUserId(request.getUserId())) {
            throw new MemberException(MemberErrorCode.DUPLICATE_USER_ID);
        }

        // 이메일 중복 검사(DB에 같은 이메일이 있으면 이미 사용중인 이메일입니다 던지고 중단)
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new MemberException(MemberErrorCode.DUPLICATE_EMAIL);
        }

        // 비밀번호 암호화(클라이언트가 비밀번호를 보내면 그걸 암호화된 문자열로 변환시켜서 디비에 저장)
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // User 엔티티 생성 (request로 받은 값들로 user 객체 생성)
        User user = User.builder()
                .userId(request.getUserId())
                .passwordHash(encodedPassword)
                .email(request.getEmail())
                .name(request.getName())
                .birthDate(request.getBirthDate())
                .build();

        // DB 저장
        userRepository.save(user);

        // SignupResponse 반환
        return SignupResponse.builder()
                .success(true)
                .user(SignupResponse.UserResponse.fromEntity(user))
                .build();
    }

    // 8. private 메서드 (있다면)(없는듯?)
}

/**
 * UserService 역할 : 회원 관련 비즈니스 로직을 처리한다.
 *
 * 사용 예시
 *
 * 회원가입
 * ↓
 * signup()
 *
 * 처리 순서
 *
 * Controller
 * ↓
 * signup() 호출
 * ↓
 * 아이디 중복 검사 existsByUserId()
 * ↓
 * 이메일 중복 검사 existsByEmail()
 * ↓
 * 비밀번호 암호화 passwordEncoder.encode()
 * ↓
 * User 엔티티 생성
 * ↓
 * DB 저장 userRepository.save()
 * ↓
 * SignupResponse 생성
 * ↓
 * Controller 반환
 */