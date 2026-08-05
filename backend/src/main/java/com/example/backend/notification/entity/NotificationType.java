package com.example.backend.notification.entity;

// 알림 종류. message는 저장 안 하고 조회 시 이 type + 조인 데이터로 조립
public enum NotificationType {
    APPROVAL_REQUEST, // 지출 등록 시 → 관리자+총무에게 "승인 요청"
    APPROVED,         // 지출 승인 시 → 작성자 + 나머지 승인권자
    REJECTED          // 지출 반려 시 → 작성자 + 나머지 승인권자
}