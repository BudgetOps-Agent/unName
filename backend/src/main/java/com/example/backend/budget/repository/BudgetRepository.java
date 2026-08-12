package com.example.backend.budget.repository;

import com.example.backend.budget.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // 팀 id로 예산 정보 조회 (my-teams 목록에서 씀)
    Optional<Budget> findByTeamId(Long teamId);
}