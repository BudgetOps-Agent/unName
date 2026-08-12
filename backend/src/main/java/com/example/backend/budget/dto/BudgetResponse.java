package com.example.backend.budget.dto;

import com.example.backend.budget.entity.Budget;
import lombok.Builder;
import lombok.Getter;

// 예산 조회(API-026) · 예산 수정(API-027) 공용 응답 DTO
// 두 API가 같은 모양을 내려줘야 프론트가 같은 타입으로 받을 수 있어서 하나로 씀
@Getter
@Builder
public class BudgetResponse {

    private boolean success;
    private BudgetInfo budget; // 프론트가 response.data.budget으로 꺼내 씀

    @Getter
    @Builder
    public static class BudgetInfo {
        private Long totalBudget;     // 총 예산
        private Long usedBudget;      // 사용 예산 (승인된 지출 합계)
        private Long remainingBudget; // 잔여 예산 (총 - 사용). DB에 안 들고 계산해서 내려줌
        private int usagePercentage;  // 사용률 % (화면 상단 "N% 사용됨")
    }

    // Budget 엔티티 → 응답 DTO 변환
    public static BudgetResponse fromEntity(Budget budget) {
        long total = budget.getTotalBudget();
        long used = budget.getUsedBudget();

        // 총 예산이 0이면 나누기 에러(ArithmeticException) 나니까 0으로 처리
        // (ReportSummary에서 쓰던 계산 방식과 동일하게 맞춤)
        int usagePercentage = total == 0 ? 0 : (int) ((used * 100) / total);

        BudgetInfo info = BudgetInfo.builder()
                .totalBudget(total)
                .usedBudget(used)
                .remainingBudget(total - used) // 예산을 줄이면 음수가 될 수 있음 (관리자 판단 영역)
                .usagePercentage(usagePercentage)
                .build();

        return BudgetResponse.builder()
                .success(true)
                .budget(info)
                .build();
    }
}
