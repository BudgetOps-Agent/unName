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

    // AI 자동 승인 사용 여부 (3단계). 기본 false = 자동승인 미사용
    // false면 지출 등록 시 전부 SUBMITTED(관리자 승인 대기)로 떨어짐
    @Column(name = "auto_approve", nullable = false)
    private Boolean autoApprove;

    // 자동 승인 최대 금액 (3단계). 이 금액 이하는 자동승인, 초과는 관리자 필수
    // autoApprove 사용 시에만 값 존재해서 NULL 허용
    @Column(name = "auto_approve_limit")
    private Long autoApproveLimit;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt; // 설정 생성 시간(수정 불가)

    @Column(nullable = false)
    private LocalDateTime updatedAt; // 마지막 수정 시간

    // 팀 생성 시 기본값 row 생성용 빌더
    // membershipFee=0, autoApprove=false, autoApproveLimit=null 로 고정
    @Builder
    public TeamSettings(Team team) {
        this.team = team;
        this.membershipFee = 0L;
        this.autoApprove = false;
        this.autoApproveLimit = null;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // 회비 변경 (AI 마법사 1단계 / 팀 설정 수정 API-029)
    public void updateMembershipFee(Long membershipFee) {
        this.membershipFee = membershipFee;
        this.updatedAt = LocalDateTime.now();
    }

    // 승인 정책 변경 (3단계 / 팀 설정 수정 API-029)
    // 관리자 설정 금액(autoApproveLimit) 하나로 "이하 자동승인 / 초과 관리자" 처리
    // 자동승인 사용 시 금액 저장, 미사용 시 null
    public void updateApprovalPolicy(Boolean autoApprove, Long autoApproveLimit) {
        this.autoApprove = autoApprove;
        this.autoApproveLimit = autoApprove ? autoApproveLimit : null;
        this.updatedAt = LocalDateTime.now();
    }
}