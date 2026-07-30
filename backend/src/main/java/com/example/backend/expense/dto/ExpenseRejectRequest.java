package com.example.backend.expense.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ExpenseRejectRequest {

    // 반려 사유 - 필수 (rejectReason 필수 입력)
    @NotBlank(message = "반려 사유는 필수입니다.")
    private String rejectReason;
}