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
        private String type;        // APPROVAL_REQUEST / APPROVED / REJECTED (프론트 아이콘 구분용)
        private Long expenseId;
        private String message;     // 서버가 조립한 문구
        private Boolean isRead;
        private String createdAt;
    }
}