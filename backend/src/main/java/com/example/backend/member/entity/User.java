// 회원 정보를 저장하는 엔티티

// 1. package
package com.example.backend.member.entity;

// 2. import


// 3. 클래스 어노테이션
// @Entity
// @Table
// @Getter
// @NoArgsConstructor

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity // JPA가 DB 테이블로 인식
@Table(name = "users") // 테이블 이름 = users로 만들기
@Getter // getter 자동 생성
@NoArgsConstructor // 기본 생성자 자동 생성
public class User {// 4. 클래스 선언

    // 5. 기본키(PK)
    @Id  // ID 어노테이션이 PK
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // auto_increment 자동으로 번호 늘어남
    private Long id;

    // 6. 회원 정보 필드
    @Column(nullable = false) // nullable = false는 null값이면 안된다
    private String name;

    @Column(unique = true, nullable = false) // unique = true 유니크(고유한 값) 중복 안되게
    private String email;

    @Column(unique = true, nullable = false)
    private String userId;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String role = "user"; // role로 역할을 나눠서 회원가입하면 기본값 user로 만듬

    @Column(nullable = false)
    private String birthDate;

    @Column(nullable = false, updatable = false) // updatable = false는 수정하거나 했을때 여기는
    private LocalDateTime createdAt;            // 처음 회원가입 했을때 시간이기때문에 수정되면 안돼서 이렇게함

    private LocalDateTime updatedAt;

    @Builder
    public User(String userId, String passwordHash, String email, String name, String birthDate) {
        this.userId = userId;               // 아이디
        this.passwordHash = passwordHash;   // 암호화된 비밀번호
        this.email = email;                 // 이메일
        this.name = name;                   // 이름
        this.birthDate = birthDate;         // 생년월일
        this.role = "user";                 // 기본 권한 user
        this.createdAt = LocalDateTime.now(); // 회원가입 했을때 시간 자동 설정
        this.updatedAt = LocalDateTime.now(); // 회원 정보 수정 했을때 자동 설정
    }

    // 7. 기본 생성자
    // JPA 사용

    // 8. 회원 생성자
}

/**
 * 회원 생성 처리 흐름
 *
 * 회원가입 요청
 * ↓
 * SignupRequest 생성
 * ↓
 * UserService 실행
 * ↓
 * User 엔티티 생성
 * ↓
 * UserRepository 저장
 * ↓
 * users 테이블 저장
 */