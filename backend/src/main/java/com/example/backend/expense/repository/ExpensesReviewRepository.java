package com.example.backend.expense.repository;

import com.example.backend.expense.entity.ExpensesReview;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpensesReviewRepository extends JpaRepository<ExpensesReview, Long> {

    // 지금은 기본 save()만 쓰면 돼서 커스텀 메서드 없음
    // (JpaRepository가 save/findById 등 기본 제공)
    // 나중에 API-022(처리 이력 조회)에서 특정 지출의 심사 목록 조회 메서드 추가 예정
    // 예: List<ExpensesReview> findByExpenseIdOrderByCreatedAtDesc(Long expenseId);
}