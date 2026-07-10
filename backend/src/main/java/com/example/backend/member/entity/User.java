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

import java.time.LocalDate;
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
    @Column(nullable = false, length = 50) // nullable = false는 null값이면 안된다
    private String name;

    @Column(unique = true, nullable = false, length = 100) // unique = true 유니크(고유한 값) 중복 안되게
    private String email;

//    @Column(unique = true, nullable = false)
//    private String userId;

    @Column(nullable = false, length = 255)
    private String password;


    @Column(unique = true, nullable = false, length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER; // role로 역할을 나눠서 회원가입하면 기본값 user로 만듬

    @Column(nullable = false)
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(nullable = false, updatable = false) // updatable = false는 수정하거나 했을때 여기는
    private LocalDateTime createdAt;            // 처음 회원가입 했을때 시간이기때문에 수정되면 안돼서 이렇게함

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public static User create(
            String password,
            String email,
            String name,
            LocalDate birthDate,
            String phone
    ) {
        User user = new User();

        user.password = password;
        user.email = email;
        user.name = name;
        user.birthDate = birthDate;
        user.phone = phone;

        user.createdAt = LocalDateTime.now();
        user.updatedAt = LocalDateTime.now();

        return user;
    }

    public void updatePassword(String newPassword) {
        this.password = newPassword;
        this.updatedAt = LocalDateTime.now();
    }

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