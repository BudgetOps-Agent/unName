package com.example.backend.policy.repository;

import com.example.backend.policy.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PolicyRepository extends JpaRepository<Policy, Long> {

    // 팀당 회칙 1개라 findByTeamId로 조회 (등록 시 있으면 수정, 없으면 생성)
    Optional<Policy> findByTeamId(Long teamId);
}