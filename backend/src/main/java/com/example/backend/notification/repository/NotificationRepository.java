package com.example.backend.notification.repository;

import com.example.backend.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 안읽은 알림 전체를 최신순으로 조회 (API-036)
    // 읽은 알림은 아예 반환 안 함 (전체보기 페이지가 없으므로), 개수 제한도 없음
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
}