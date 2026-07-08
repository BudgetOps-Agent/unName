package com.example.backend.team.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateTeamRequest {

    @NotBlank(message = "모임 이름은 필수입니다.")
    private String name; // 모임 이름 (빈칸 절대 안됨)

    @Size(max = 255, message = "모임 소개는 255자 이내로 작성해주세요.")
    private String description; // 모임 소개 (안써도 되지만 너무 많이 쓰면 안됨 255자)

    @NotNull(message = "초기 예산은 필수입니다.")
    private Long initialBudget; // 초기 예산 (무조건 적어야됨)
}