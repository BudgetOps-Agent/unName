package com.example.backend.expense.repository;

import com.example.backend.expense.entity.Expense;
import com.example.backend.expense.entity.ExpenseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // 특정 모임(teamId)의 지출 목록을 상태(status) 조건으로 걸러서 조회하는 메서드 (필터링)
    // statuses는 하나가 아니라 여러 개를 리스트로 받음
    // DB에서 "WHERE team_id = ? AND status IN (...)" 쿼리로 변환됨
    // IN 조건이라서 리스트 안에 있는 값 중 하나만 일치해도 결과에 포함됨
    // 전체 탭 -> List.of("SUBMITTED","ESCALATED","APPROVED","REJECTED") 넘기면 다 조회됨
    // 대기 탭 -> List.of("SUBMITTED","ESCALATED") 넘기면 이 둘만 조회됨
    // Ai 가 애매해서 에스컬레이션으로 넘기면 거기에도 승인대기, 에스컬레이션 이렇게 뜨니깐 이렇게 함
    // 승인 탭 -> List.of("APPROVED")만 넘기면 승인만 조회 됨
    // 반려 탭 -> List.of("REJECTED")만 넘기면 반려만 조회 됨
    List<Expense> findByTeamIdAndStatusIn(Long teamId, List<ExpenseStatus> statuses);

    List<Expense> findByTeamIdAndStatusInOrderByExpenseDateDesc(
            Long teamId,
            List<ExpenseStatus> statuses
    );

    // 지출 목록 조회(API-015) — MEMBER 권한용: 본인이 요청한 지출만 상태 필터로 조회
    // (관리자/총무는 위의 팀 전체 조회를 쓰고, 일반 멤버는 이 메서드로 자기 것만 봄)
    List<Expense> findByTeamIdAndUserIdAndStatusInOrderByExpenseDateDesc(
            Long teamId,
            Long userId,
            List<ExpenseStatus> statuses
    );

    // MEMBER 권한용 상태별 개수 — 본인 지출만 카운트 (탭 숫자도 본인 것 기준)
    long countByTeamIdAndUserIdAndStatusIn(Long teamId, Long userId, List<ExpenseStatus> statuses);

    // 상태별 개수 세기 - 탭에 표시할 카운트(전체/대기/승인/반려) 계산할 때 씀
    // 상태별 개수 셀때 마다 findByTeamIdAndStatusIn() 바로 위에 있는 이 메서드를 사용하면
    // 전체 목록을 가져와서 .size()해서 조회하는거라 비효율적인거 같고 불필요한것들이 같이 조회 될 수도 있어서 이 메서드 씀(안쓰는 데이터까지 가져와서 보여주고 계산함)
    // DB한테만 이거 몇개인지 알려줘 하는 메서드 "SELECT COUNT(*) WHERE team_id = ? AND status IN (...)"
    long countByTeamIdAndStatusIn(Long teamId, List<ExpenseStatus> statuses);

    // 정산 리포트용 (API-050) - 승인된 지출을 승인일 최신순으로 조회
    List<Expense> findByTeamIdAndStatusOrderByApprovedAtDesc(
            Long teamId,
            ExpenseStatus status
    );
    Page<Expense> findByTeamIdAndStatusOrderByApprovedAtDesc(
            Long teamId,
            ExpenseStatus status,
            Pageable pageable
    );
    // 대시보드 미리보기용 (API-023) - 승인 대기(SUBMITTED+ESCALATED) 지출을 최신순으로 조회
    // Pageable로 개수 제한 (상위 N개만)
    List<Expense> findByTeamIdAndStatusInOrderByCreatedAtDesc(
            Long teamId, List<ExpenseStatus> statuses, Pageable pageable);

    // 월별 승인 지출 합계 (막대그래프용, API-047)
    // expense_date 기준으로 "연-월"별로 묶어서(GROUP BY) 금액 합산, 승인된 것만
    // 단순 메서드 이름으로는 "월별로 묶어서 합계내기(GROUP BY + SUM)"가 불가능해서 직접 쿼리 작성
    @Query("""
        SELECT FUNCTION('DATE_FORMAT', e.expenseDate, '%Y-%m') AS ym,
               SUM(e.amount) AS total
        FROM Expense e
        WHERE e.team.id = :teamId
        AND e.status = :status
        AND e.expenseDate >= :startDate
        GROUP BY FUNCTION('DATE_FORMAT', e.expenseDate, '%Y-%m')
        ORDER BY ym ASC
        """)
    List<Object[]> findMonthlyTotals(@Param("teamId") Long teamId,
                                     @Param("status") ExpenseStatus status,
                                     @Param("startDate") LocalDate startDate);

    // 카테고리별 지출 통계 (도넛차트용, API-048)
    // 이번 달에 "승인된" 지출을 카테고리별로 묶어서(GROUP BY) 금액 합산
    // - 승인일(approvedAt) 기준: 이번 달 안에 승인 확정된 것만 (start <= approvedAt < end)
    // - category가 NULL인 건 제외 (AI 심사 전이라 분류가 안 된 지출 — 도넛 범례에 빈칸 뜨는 것 방지)
    // 단순 메서드 이름으로는 GROUP BY + SUM이 안 돼서 직접 쿼리 작성
    @Query("""
        SELECT e.category AS category,
               SUM(e.amount) AS total
        FROM Expense e
        WHERE e.team.id = :teamId
        AND e.status = :status
        AND e.category IS NOT NULL
        AND e.approvedAt >= :start
        AND e.approvedAt < :end
        GROUP BY e.category
        ORDER BY total DESC
        """)
    List<Object[]> findCategoryTotals(@Param("teamId") Long teamId,
                                      @Param("status") ExpenseStatus status,
                                      @Param("start") LocalDateTime start,
                                      @Param("end") LocalDateTime end);
}