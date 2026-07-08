package com.example.backend.team.repository;

import com.example.backend.team.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRepository extends JpaRepository<Team, Long> {

    // 모임 이름 중복 확인
    boolean existsByName(String name);
}