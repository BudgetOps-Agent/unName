package com.example.backend.expense.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 지출 수정(API-018) 요청 DTO
// multipart/form-data로 받음 (글자값 + 영수증 파일 교체 가능) — 등록(API-016)과 동일 방식
// 영수증 파일(receiptFile)은 여기 안 넣고 Controller에서 @RequestPart로 별도 수령
// 카테고리는 사용자가 고르는 값이 아니라(AI가 채움) 수정 항목에서 제외 — 등록과 동일 정책
@Getter
@Setter // multipart는 Setter로 값 채움
@NoArgsConstructor
public class ExpenseUpdateRequest {

    // 지출 제목 필수, 공백만 있으면 안 됨
    @NotBlank(message = "지출 제목은 필수입니다.")
    private String title;

    // 지출 금액 필수, 0보다 커야 함
    @NotNull(message = "금액은 필수입니다.")
    @Positive(message = "금액은 0보다 커야 합니다.")
    private Long amount;

    // 설명은 선택
    private String description;
}
