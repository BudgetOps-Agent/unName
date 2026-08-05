package com.example.backend.notification.entity;

import com.example.backend.expense.entity.Expense;
import com.example.backend.member.entity.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 알림 수신자 (users.id FK)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 관련 지출 (expenses.id FK). 지출 아닌 알림도 있을 수 있어 NULL 허용
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id")
    private Expense expense;

    // 알림 종류. message 조립 시 이 값으로 문구 분기
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    // 읽음 상태. 기본 false(안읽음)
    @Column(name = "is_read", nullable = false)
    private Boolean isRead;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Notification(User user, Expense expense, NotificationType type) {
        this.user = user;
        this.expense = expense;
        this.type = type;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    // 읽음 처리 (API-037)
    public void markAsRead() {
        this.isRead = true;
    }
}