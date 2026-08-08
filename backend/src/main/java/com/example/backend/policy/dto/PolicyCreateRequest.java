package com.example.backend.policy.dto;

import com.example.backend.policy.entity.PolicyType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter // multipart/form-data는 값을 Setter로 채워넣어서 @Setter가 필요함 (지출 등록 DTO랑 동일)
@NoArgsConstructor // 기본 생성자 필요 (Spring이 빈 객체 만들고 Setter로 하나씩 채우는 방식)
public class PolicyCreateRequest {

    // 등록 방식 (TEXT=직접입력·AI초안 / FILE=파일업로드)
    @NotNull(message = "등록 방식은 필수입니다.")
    private PolicyType policyType;

    // 정책 내용 (TEXT일 때만 사용, FILE이면 null)
    // 직접입력 텍스트 또는 AI 초안으로 받은 텍스트가 여기 담김
    private String content;

    // file은 여기 안 넣음 — Controller에서 @RequestPart로 별도 받음 (파일만 별도 파트)
}