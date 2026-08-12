package com.example.backend.team.dto;

import com.example.backend.team.entity.TeamSettings;
import lombok.Builder;
import lombok.Getter;

// 팀 설정 조회(API-028) 응답 DTO — 회칙·정책 관리 화면에서 회비·승인정책 현재값 표시용
@Getter
@Builder
public class TeamSettingsResponse {

    private boolean success;
    private Settings settings;

    @Getter
    @Builder
    public static class Settings {
        private Long membershipFee;      // 회비 (0이면 없음)
        private Boolean autoApprove;     // 자동승인 사용 여부
        private Long autoApproveLimit;   // 이 금액 이하는 자동승인, 초과는 관리자 필수 (미사용 시 null)
    }

    // TeamSettings 엔티티 → 응답 DTO로 변환
    public static TeamSettingsResponse fromEntity(TeamSettings settings) {
        return TeamSettingsResponse.builder()
                .success(true)
                .settings(Settings.builder()
                        .membershipFee(settings.getMembershipFee())
                        .autoApprove(settings.getAutoApprove())
                        .autoApproveLimit(settings.getAutoApproveLimit())
                        .build())
                .build();
    }
}
