package com.example.backend.team.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "team_settings")
@Getter
@NoArgsConstructor
public class TeamSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // teams 테이블 외래키 (일대일 - 한 모임당 설정 하나)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false, unique = true)
    private Team team;

    // 회비 (AI 마법사 1단계). 0이면 회비 없음. 스키마상 NOT NULL DEFAULT 0
    @Column(name = "membership_fee", nullable = false)
    private Long membershipFee;

    // AI 자동 승인 사용 여부 (2단계). 기본 false = 자동승인 미사용
    // false면 지출 등록 시 전부 SUBMITTED(관리자 승인 대기)로 떨어짐
    @Column(name = "auto_approve", nullable = false)
    private Boolean autoApprove;

    // 자동 승인 최대 금액 (2단계). autoApprove 사용 시에만 값 존재해서 NULL 허용
    @Column(name = "auto_approve_limit")
    private Long autoApproveLimit;

    // 에스컬레이션 상한액. 이 금액 초과 지출은 무조건 관리자 검토로 넘어감
    // 스키마상 NOT NULL. 3단계에서 AI 초안의 force_escalation_amount로 채워짐
    // 팀 생성 시점엔 총예산으로 초기화 → 사실상 에스컬레이션 비활성 상태
    @Column(name = "escalation_threshold", nullable = false)
    private Long escalationThreshold;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt; // 설정 생성 시간(수정 불가)

    @Column(nullable = false)
    private LocalDateTime updatedAt; // 마지막 수정 시간

    // 팀 생성 시 기본값 row 생성용 빌더
    // membershipFee=0, autoApprove=false, autoApproveLimit=null 로 고정
    // escalationThreshold는 팀 생성 시 총예산을 넘겨받아 초기화
    @Builder
    public TeamSettings(Team team, Long escalationThreshold) {
        this.team = team;
        this.membershipFee = 0L;
        this.autoApprove = false;
        this.autoApproveLimit = null;
        this.escalationThreshold = escalationThreshold;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // 회비 변경 (AI 마법사 1단계 / 팀 설정 수정 API-029)
    public void updateMembershipFee(Long membershipFee) {
        this.membershipFee = membershipFee;
        this.updatedAt = LocalDateTime.now();
    }

    // 자동승인 설정 변경 (2단계 확정 후 / API-029)
    public void updateAutoApprove(Boolean autoApprove, Long autoApproveLimit) {
        this.autoApprove = autoApprove;
        this.autoApproveLimit = autoApproveLimit;
        this.updatedAt = LocalDateTime.now();
    }

    // 에스컬레이션 상한액 변경 (3단계에서 AI 초안 force_escalation_amount 반영)
    public void updateEscalationThreshold(Long escalationThreshold) {
        this.escalationThreshold = escalationThreshold;
        this.updatedAt = LocalDateTime.now();
    }
}