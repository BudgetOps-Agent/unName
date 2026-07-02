// User 엔티티의 DB 접근 담당

// 1. package
package com.example.backend.member.repository;

// 2. import


// 3. 인터페이스 선언
// JpaRepository 상속

import com.example.backend.member.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 4. 기본 CRUD
    // save()
    // findById()
    // delete()
    // findAll()
    // JPARepository를 상속하면 Spring Data JPA가 기본적인 CRUD 메서드를 미리 만들어놔서
    // 구현 안해도 바로 쓸 수 있음.

    // 5. 사용자 정의 조회 메서드
    // findByUserId()
    // findByEmail()

    // 6. 중복 확인 메서드
    // existsByUserId()
    // existsByEmail()

    // Optional<User> findByUserId(String userId); // 사용자 정의 조회 메서드
    Optional<User> findByEmail(String email);

    // boolean existsByUserId(String userId); // 중복 확인 메서드
    boolean existsByEmail(String email);

    // 아이디 찾기
    Optional<User> findByNameAndPhone(String name, String phone);

    // 비밀번호 조회
    Optional<User> findByEmailAndName(String email, String name);
}

/**
 * UserRepository 역할
 *
 * User 엔티티의 DB 작업을 담당한다.
 *
 * 사용 예시
 *
 * 회원 저장
 * ↓
 * save(user)
 *
 * 회원 조회
 * ↓
 * findByUserId()
 *
 * 이메일 조회
 * ↓
 * findByEmail()
 *
 * 아이디 중복 확인
 * ↓
 * existsByUserId()
 *
 * 이메일 중복 확인
 * ↓
 * existsByEmail()
 *
 * 처리 순서
 *
 * Controller
 * ↓
 * Service
 * ↓
 * UserRepository
 * ↓
 * Database
 */