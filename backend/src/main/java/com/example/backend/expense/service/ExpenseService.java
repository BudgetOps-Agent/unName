package com.example.backend.expense.service;

import com.example.backend.expense.dto.ExpenseListResponse;
import com.example.backend.expense.entity.Expense;
import com.example.backend.expense.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service // 이 클래스가 비즈니스 로직 담당이라는 표시, Spring이 자동으로 Bean 등록
@RequiredArgsConstructor // final 필드들 받는 생성자를 Lombok이 자동으로 만들어줌 (직접 안 써도 됨)
public class ExpenseService {

    // Repository 주입 (final로 선언 → @RequiredArgsConstructor가 알아서 생성자에 넣어줌)
    private final ExpenseRepository expenseRepository;

    // 지출 목록 조회 (API-014)
    //
    // status=null 또는 "ALL"이면 전체 조회
    // status="SUBMITTED"면 대기(SUBMITTED+ESCALATED 둘 다 조회)
    // status="APPROVED"/"REJECTED"면 해당 상태만 단독 조회
    // @Transactional(readOnly = true)를 쓰는 이유
    // 아래에서 expense.getUser().getName() 을 부르는데
    // User 필드가 LAZY 로딩이라 이걸 부르는 시점에 DB 세션이 살아있어야 함
    // 안 붙이면 예전에 겪었던 LazyInitializationException에러 다시 만날 수 있음
    // 지금 이 데이터를 가져오려는데, DB 연결(세션)이 이미 끊겨서 못 가져옵니다~ 하는 에러
    // 프론트가 status 값 하나를 보내면, 그 값에 맞는 지출들을 조회해서 응답 만들어 돌려주는 메서드
    @Transactional(readOnly = true)
    public ExpenseListResponse getExpenses(Long teamId, String status) {

        // 1. 요청받은 status에 따라 실제로 조회할 상태 리스트를 결정
        // resolveStatusFilter 이거를
        // 프론트가 보낸 값 하나(status)를 DB 조회용 리스트로 바꿔주는 단계.
        List<String> statusFilter = resolveStatusFilter(status);

        // 2. 그 조건으로 지출 목록 조회
        List<Expense> expenses = expenseRepository.findByTeamIdAndStatusIn(teamId, statusFilter);

        // 3. Expense 엔티티 → ExpenseInfo(DTO)로 변환
        List<ExpenseListResponse.ExpenseInfo> expenseInfos = expenses.stream()
                .map(ExpenseListResponse.ExpenseInfo::fromEntity)
                .collect(Collectors.toList());

        // 4. 탭에 표시할 상태별 개수 계산
        ExpenseListResponse.Counts counts = ExpenseListResponse.Counts.builder()
                .all(expenseRepository.countByTeamIdAndStatusIn(teamId,
                        List.of("SUBMITTED", "ESCALATED", "APPROVED", "REJECTED")))
                .pending(expenseRepository.countByTeamIdAndStatusIn(teamId,
                        List.of("SUBMITTED", "ESCALATED")))
                .approved(expenseRepository.countByTeamIdAndStatusIn(teamId,
                        List.of("APPROVED")))
                .rejected(expenseRepository.countByTeamIdAndStatusIn(teamId,
                        List.of("REJECTED")))
                .build();

        // 5. 응답 반환
        return ExpenseListResponse.builder()
                .success(true)
                .counts(counts)
                .expenses(expenseInfos)
                .build();
    }

    // status 파라미터 값에 따라 실제 조회할 상태 리스트를 정하는 메서드
    // "대기" 탭 요청이면 SUBMITTED+ESCALATED 둘 다 조회해야 하므로 이렇게 처리함
    private List<String> resolveStatusFilter(String status) {
        if (status == null || status.equals("ALL")) {
            return List.of("SUBMITTED", "ESCALATED", "APPROVED", "REJECTED"); // 전체
        } else if (status.equals("SUBMITTED")) {
            return List.of("SUBMITTED", "ESCALATED"); // 대기 탭 = SUBMITTED + ESCALATED
        } else {
            return List.of(status); // APPROVED 또는 REJECTED 단독
        }
    }
}