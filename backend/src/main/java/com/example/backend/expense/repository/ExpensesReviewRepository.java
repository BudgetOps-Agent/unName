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

    // AI 심사 결과 조회(API-046)용 — 이 지출의 가장 최근 "AI가 처리한" 심사기록 1건
    // 나중에 관리자가 최종 승인/반려해도(HUMAN 기록이 추가로 쌓임) 심사관별 소견 카드는
    // 항상 AI가 분석한 근거를 보여줘야 하므로 processedBy=AI인 것만 찾음
    java.util.Optional<com.example.backend.expense.entity.ExpensesReview> findTopByExpenseIdAndProcessedByOrderByCreatedAtDesc(
            Long expenseId, com.example.backend.expense.entity.ProcessedBy processedBy);
}