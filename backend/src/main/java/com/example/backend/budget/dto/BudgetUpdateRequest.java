package com.example.backend.budget.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 예산 수정(API-027) 요청용 DTO
// 예산 관리 화면의 "예산 수정" 모달에서 금액 입력 후 저장할 때 사용
@Getter
@Setter
@NoArgsConstructor
public class BudgetUpdateRequest {

    // 변경할 총 예산. 0은 허용(예산 없음), 음수는 막음
    @NotNull(message = "총 예산은 필수입니다.")
    @PositiveOrZero(message = "총 예산은 0 이상이어야 합니다.")
    private Long totalBudget;
}
