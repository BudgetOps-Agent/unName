package com.example.backend.notification.controller;

import com.example.backend.member.entity.User;
import com.example.backend.member.exception.MemberErrorCode;
import com.example.backend.member.exception.MemberException;
import com.example.backend.member.repository.UserRepository;
import com.example.backend.notification.dto.NotificationListResponse;
import com.example.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // 알림 목록 조회 (API-036) — 로그인 유저의 안읽은 알림 전체
    @GetMapping
    public ResponseEntity<NotificationListResponse> getNotifications() {
        // 1. 토큰에서 로그인 유저 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 유저 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. 그 유저의 안읽은 알림 조회
        NotificationListResponse response = notificationService.getNotifications(user.getId());
        return ResponseEntity.ok(response);
    }

    // 알림 읽음 처리 (API-037)
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable("notificationId") Long notificationId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        notificationService.markAsRead(notificationId, user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "알림을 읽음 처리했습니다.");
        return ResponseEntity.ok(response);
    }
}