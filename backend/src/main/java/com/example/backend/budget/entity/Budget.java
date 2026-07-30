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

    @Column(name = "total_budget", nullable = false)
    private Long totalBudget;

    @Column(name = "used_budget", nullable = false)
    private Long usedBudget; // 사용한 예산

    @Column(nullable = false)
    private LocalDateTime updatedAt; // 수정 시간

    // teams 테이블 외래키 (일대일 - 한 모임당 예산 정보 하나)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false, unique = true)
    private Team team;

    @Builder
    public Budget(Long totalBudget, Long usedBudget, Team team) {
        this.totalBudget = totalBudget;
        this.usedBudget = usedBudget;
        this.team = team;
        this.updatedAt = LocalDateTime.now(); // 생성 시점 시간 찍기
    }

    // 나중에 예산 변경(지출 승인 등)할 때 쓸 메서드  이때도 updatedAt 같이 갱신
    public void updateBudget(Long totalBudget, Long usedBudget) {
        this.totalBudget = totalBudget;
        this.usedBudget = usedBudget;
        this.updatedAt = LocalDateTime.now();
    }

    // 지출 승인 시 사용 예산 증가 (API-019)
    // 승인된 지출 금액만큼 usedBudget을 늘림 (남은 예산은 total-used 계산값이라 안 건드림)
    // 스키마 규칙: used_budget은 직접 UPDATE 금지 → 이 메서드로만 갱신
    public void addUsedBudget(Long amount) {
        this.usedBudget += amount;            // 사용 예산에 지출 금액 더하기
        this.updatedAt = LocalDateTime.now(); // 수정 시각 갱신
    }
}