package com.example.backend.policy.dto;

import com.example.backend.policy.entity.PolicyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PolicyCreateRequest {

    // 정책 제목 (필수)
    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    // 등록 방식 (TEXT=직접입력·AI초안 / FILE=파일업로드)
    @NotNull(message = "등록 방식은 필수입니다.")
    private PolicyType policyType;

    // 정책 내용 (TEXT일 때만 사용, FILE이면 null)
    // 직접입력 텍스트 또는 AI 초안으로 받은 텍스트가 여기 담김
    private String content;

    // file은 여기 안 넣음 — Controller에서 @RequestPart로 별도 받음 (multipart)
}