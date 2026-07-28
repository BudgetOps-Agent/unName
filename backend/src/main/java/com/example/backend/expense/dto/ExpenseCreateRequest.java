package com.example.backend.expense.dto;

import com.example.backend.expense.entity.ExpenseCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    // 카테고리 필수. enum이라 @NotNull 사용 (@NotBlank는 String 전용)
    // 프론트가 "회의","IT_인프라"등 enum 이름 그대로 보내면 Spring이 자동 변환해줌
    // 카테고리 (회의/IT인프라/행사/교육/식비/디자인/기타)
    @NotNull(message = "카테고리는 필수입니다.")
    private ExpenseCategory category;

    // 설명 선택이여서 검증 안 붙임
    private String description;

    // 영수증 파일(receiptFile)은 여기 안넣음
    // 파일은 Controller에서 @RequestPart로 따로 받음
}