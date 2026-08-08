package com.example.backend.expense.repository;

import com.example.backend.expense.entity.ExpensesReview;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpensesReviewRepository extends JpaRepository<ExpensesReview, Long> {

    // 지금은 기본 save()만 쓰면 돼서 커스텀 메서드 없음
    // (JpaRepository가 save/findById 등 기본 제공)
    // 나중에 API-022(처리 이력 조회)에서 특정 지출의 심사 목록 조회 메서드 추가 예정
    // 예: List<ExpensesReview> findByExpenseIdOrderByCreatedAtDesc(Long expenseId);

    // 지출 삭제(API-021)용 — 해당 지출의 심사 기록을 먼저 지움
    // expenses_reviews.expense_id가 NOT NULL FK라, 지출을 hard delete 하기 전에 자식부터 정리해야 함
    void deleteByExpenseId(Long expenseId);
}