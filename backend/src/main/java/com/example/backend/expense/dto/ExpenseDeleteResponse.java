package com.example.backend.expense.dto;

import lombok.Builder;
import lombok.Getter;

// 지출 삭제(API-021) 응답 DTO
// 명세: success + message. DB에서 완전 삭제(hard delete) 후 반환
@Getter
@Builder
public class ExpenseDeleteResponse {

    private boolean success;  // 성공 여부 (항상 true)
    private String message;   // 결과 메시지

    public static ExpenseDeleteResponse of() {
        return ExpenseDeleteResponse.builder()
                .success(true)
                .message("지출이 삭제되었습니다.")
                .build();
    }
}
