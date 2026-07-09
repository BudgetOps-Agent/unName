package com.example.backend.budget.entity;

import com.example.backend.team.entity.Team;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "budgets")
@Getter
@NoArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "remaining_budget", nullable = false)
    private Long remainingBudget; // 현재 남은 예산

    @Column(name = "used_budget", nullable = false)
    private Long usedBudget; // 사용한 예산

    @Column(nullable = false)
    private LocalDateTime updatedAt; // 수정 시간

    // teams 테이블 외래키 (일대일 - 한 모임당 예산 정보 하나)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Builder
    public Budget(Long remainingBudget, Long usedBudget, Team team) {
        this.remainingBudget = remainingBudget;
        this.usedBudget = usedBudget;
        this.team = team;
        this.updatedAt = LocalDateTime.now(); // 생성 시점 시간 찍기
    }

    // 나중에 예산 변경(지출 승인 등)할 때 쓸 메서드  이때도 updatedAt 같이 갱신
    public void updateBudget(Long remainingBudget, Long usedBudget) {
        this.remainingBudget = remainingBudget;
        this.usedBudget = usedBudget;
        this.updatedAt = LocalDateTime.now();
    }
}