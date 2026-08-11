package com.example.backend.notification.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class NotificationListResponse {

    private boolean success;
    private List<NotificationInfo> notifications;

    @Getter
    @Builder
    public static class NotificationInfo {
        private Long id;
        private String type;          // APPROVAL_REQUEST / APPROVED / REJECTED
        private Long teamId;          // 이 알림이 속한 팀 (프론트가 팀 경로 링크 만들 때 씀, 지출 없는 알림이면 null)
        private Long expenseId;
        private String expenseTitle;  // 지출 제목 (예: "해커톤 참가비")
        private String actorName;     // 관련 사람 이름 (요청=작성자, 승인/반려=처리자, AI면 null)
        private Boolean isRead;
        private String createdAt;
    }
}