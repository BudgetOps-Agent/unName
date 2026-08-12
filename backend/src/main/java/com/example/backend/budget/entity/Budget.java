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

    // 총 예산 설정 (API-027 - 예산 수정 모달)
    // 받은 값으로 총 예산을 설정함(덮어쓰기).
    // 화면상 "추가하기" 동작은 프론트가 이미 (기존 예산 + 입력 금액)을 더해서 보내주기 때문에
    // 백엔드는 그 최종 합계를 그대로 저장하면 됨. 여기서 또 더하면 이중 합산되므로 주의.
    // 사용 예산(usedBudget)은 지출 승인/취소로만 바뀌는 값이라 여기선 안 건드림
    public void updateTotalBudget(Long totalBudget) {
        this.totalBudget = totalBudget;
        this.updatedAt = LocalDateTime.now();
    }

    public void addUsedBudget(Long amount) {
        this.usedBudget += amount;            // 사용 예산에 지출 금액 더하기
        this.updatedAt = LocalDateTime.now(); // 수정 시각 갱신
    }
}