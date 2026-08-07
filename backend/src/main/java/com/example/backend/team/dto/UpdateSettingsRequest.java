package com.example.backend.team.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateSettingsRequest {
    // 1단계 - 회비 (0이면 없음)
    private Long membershipFee;

    // 3단계 - 승인 정책
    private Boolean autoApprove;      // 토글 (true=자동승인 사용, false=관리자 직접)
    private Long autoApproveLimit;    // 관리자 설정 금액 (이하 자동승인, 초과 관리자)
}