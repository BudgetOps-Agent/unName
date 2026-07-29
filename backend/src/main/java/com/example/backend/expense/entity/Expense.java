package com.example.backend.expense.entity;

import com.example.backend.member.entity.User;
import com.example.backend.team.entity.Team;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Getter
@NoArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // teams 테이블 외래키 (다대일 - 여러 지출이 한 모임에 속함)
    @ManyToOne(fetch = FetchType.LAZY) // LAZY 쓰는 이유는 필요할때만 써서 불필요한 조회 안하게 만들어서 속도를 느려지는걸 막기 위해서
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    // users 테이블 외래키 (작성자/신청자)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // users 테이블 외래키 (최종 승인/반려 처리자, 처리 전엔 NULL)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(nullable = false)
    private String title; // 지출 제목

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseCategory category; // 지출 카테고리 (회의/IT_인프라/행사/교육/식비/디자인/기타)

    @Column(nullable = false)
    private Long amount; // 지출 금액

    @Column(columnDefinition = "TEXT")
    private String description; // 지출 사유 상세

    @Column(name = "receipt_url", length = 500)
    private String receiptUrl; // 영수증 파일 경로

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseStatus status; // 처리 상태 (대기/에스컬레이션/승인/반려) // 처리 상태 (SUBMITTED/ESCALATED/APPROVED/REJECTED)


    @Enumerated(EnumType.STRING)
    @Column(name = "processed_by")
    private ProcessedBy processedBy; // 최종 처리 주체 (AI/HUMAN)

    @Column(name = "reject_reason", length = 500)
    private String rejectReason; // 반려 사유

    @Column(name = "approved_at")
    private LocalDateTime approvedAt; // 승인/반려 확정 시각

    @Column(nullable = false)
    private Integer version = 0; // 동시 승인 방지용 버전 (여러 명이 동시에 승인 못 하게 방지 체크)

    // AI 심사 연동용 (API-045에서 사용, 지금은 값 없이 NULL)
    @Column(name = "ai_job_id", length = 36)
    private String aiJobId; // Agent Server에 보낸 최신 심사 작업 ID (콜백 매칭용)

    @Column(name = "ai_dispatched_at")
    private LocalDateTime aiDispatchedAt; // 최신 심사 요청 보낸 시각 (타임아웃 판단용)

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt; // 지출 등록 시간

    @Column(nullable = false)
    private LocalDateTime updatedAt; // 수정 시간

    @Builder
    public Expense(Team team, User user, String title, ExpenseCategory category,
                   Long amount, String description, String receiptUrl) {
        this.team = team;
        this.user = user;
        this.title = title;
        this.category = category;
        this.amount = amount;
        this.description = description;
        this.receiptUrl = receiptUrl;
        this.status = ExpenseStatus.SUBMITTED; // 지출 등록하면 기본값은 항상 SUBMITTED (승인 대기)
        this.version = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // 지출 반려 처리 (API-020)
    // 반려 시 상태/사유/처리자/처리시각을 한 번에 바꿈
    // Service에서 이 메서드를 호출하면 JPA 변경감지(dirty checking)로 자동 UPDATE 됨
    public void reject(User approvedBy, String rejectReason) {
        this.status = ExpenseStatus.REJECTED;   // 상태를 반려로
        this.rejectReason = rejectReason;        // 반려 사유 저장
        this.approvedBy = approvedBy;            // 처리한 사람(반려한 관리자/총무)
        this.processedBy = ProcessedBy.HUMAN;    // 사람이 처리했다는 표시
        this.approvedAt = LocalDateTime.now();   // 처리 확정 시각
        this.updatedAt = LocalDateTime.now();    // 수정 시각 갱신
    }
}