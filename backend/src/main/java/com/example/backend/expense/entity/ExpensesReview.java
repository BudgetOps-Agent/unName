package com.example.backend.expense.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "expenses_reviews")
@Getter
@NoArgsConstructor
public class ExpensesReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 심사 고유 번호

    // 어떤 지출에 대한 심사인지 (expenses 테이블 외래키)
    // 여러 심사가 한 지출에 달릴 수 있음(다대일) — AI심사 후 사람이 또 처리하면 row 2개
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;

    // 심사 결과 (APPROVED / REJECTED)
    @Enumerated(EnumType.STRING)
    @Column(name = "final_verdict", nullable = false)
    private FinalVerdict finalVerdict;

    // 심사 결과 상세 내용 (JSON 형태로 저장)
    // 사람이 반려할 땐 반려 사유를, AI가 심사할 땐 심사관별 근거를 담음
    @Column(columnDefinition = "json")
    private String detail;

    // AI 추천 카테고리 (AI 심사일 때만 값 있음, 사람 처리면 null)
    @Column(name = "suggested_category", length = 50)
    private String suggestedCategory;

    // 최종 처리 주체 (AI / HUMAN)
    // 사람이 승인/반려하면 HUMAN, AI 자동처리면 AI
    @Enumerated(EnumType.STRING)
    @Column(name = "processed_by", nullable = false)
    private ProcessedBy processedBy; // 기존에 만든 ProcessedBy enum(AI, HUMAN) 재활용

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt; // 심사 결과 생성일

    @Builder
    public ExpensesReview(Expense expense, FinalVerdict finalVerdict, String detail,
                          String suggestedCategory, ProcessedBy processedBy) {
        this.expense = expense;
        this.finalVerdict = finalVerdict;
        this.detail = detail;
        this.suggestedCategory = suggestedCategory;
        this.processedBy = processedBy;
        this.createdAt = LocalDateTime.now();
    }
}