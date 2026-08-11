package com.example.backend.expense.dto;

import com.example.backend.expense.entity.ExpenseCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter // multipart/form-data는 값을 Setter로 채워넣어서 @Setter가 필요함 (JSON이랑 다른 점)
@NoArgsConstructor // 기본 생성자 필요 (Spring이 빈 객체 만들고 Setter로 하나씩 채우는 방식)
public class ExpenseCreateRequest {

    // 지출 제목 필수, 공백만 있으면 안 됨
    @NotBlank(message = "지출 제목은 필수입니다.")
    private String title;

    // 지출 금액 필수, 0보다 커야 함 (음수/0 막기)
    @NotNull(message = "금액은 필수입니다.")
    @Positive(message = "금액은 0보다 커야 합니다.") // @Positive는 양수만 허용하는 어노테이션 0보다 큰 값만 통과
    private Long amount;

    // 카테고리 - 안 보내도 됨 (8/4 회의 반영)
    // 사용자가 직접 고르는 기능이 없어져서 등록 시엔 비어있고,
    // AI 심사 콜백(CB-001)의 suggestedCategory로 나중에 채워짐
    private ExpenseCategory category;

    // 지출 발생 날짜 - 필수 (실제로 돈 쓴 날. 등록 시각 createdAt과 다름)
    // 프론트가 "2025-01-24" 형식으로 보내면 Spring이 LocalDate로 자동 변환
    // 아직 안 쓴 돈일 순 없으니 오늘이거나 그 이전만 허용 (미래 날짜 선택 방지)
    @NotNull(message = "지출 발생 날짜는 필수입니다.")
    @PastOrPresent(message = "지출 발생 날짜는 오늘이거나 그 이전이어야 합니다.")
    private LocalDate expenseDate;

    // 설명 선택이여서 검증 안 붙임
    private String description;

    // 영수증 파일(receiptFile)은 여기 안넣음
    // 파일은 Controller에서 @RequestPart로 따로 받음
}