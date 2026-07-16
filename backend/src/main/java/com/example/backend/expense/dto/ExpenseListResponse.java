package com.example.backend.expense.dto;

import com.example.backend.expense.entity.Expense;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

// 지출 목록 조회(API-014) 응답용 DTO
@Getter
@Builder
public class ExpenseListResponse {

    private boolean success;
    private Counts counts; // 탭에 표시할 상태별 개수
    private List<ExpenseInfo> expenses; // 실제 지출 목록

    // 상태별 개수 (전체/대기/승인/반려)
    @Getter
    @Builder
    public static class Counts {
        private long all;       // 전체 다
        private long pending; // SUBMITTED + ESCALATED 합산 (승인 대기 + 에스컬레이션), 어차피 똑같은 대기라 같이 묶어놓음
        private long approved; // 승인됨
        private long rejected; // 반려됨
    }

    // 지출 목록 안에 들어갈 항목 하나하나의 정보
    @Getter
    @Builder
    public static class ExpenseInfo {
        private Long id; // 지출 고유 번호
        private String title; // 지출 제목
        private Long amount; // 지출 금액
        private String status; // SUBMITTED/ESCALATED/APPROVED/REJECTED 그대로 내려줌
        private String requesterName; // 작성자 이름
        private String date; // 지출 등록일

        // Expense 엔티티를 ExpenseInfo(DTO)로 변환하는 메서드
        public static ExpenseInfo fromEntity(Expense expense) {
            return ExpenseInfo.builder()
                    .id(expense.getId())
                    .title(expense.getTitle())
                    .amount(expense.getAmount())
                    .status(expense.getStatus())
                    .requesterName(expense.getUser().getName()) // User 엔티티 타고 들어가서 이름 꺼내기
                    .date(expense.getCreatedAt().toString())
                    .build();
        }
    }
}