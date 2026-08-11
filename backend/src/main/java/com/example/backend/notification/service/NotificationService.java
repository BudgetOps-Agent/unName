package com.example.backend.notification.service;

import com.example.backend.expense.entity.Expense;
import com.example.backend.member.entity.User;
import com.example.backend.notification.dto.NotificationListResponse;
import com.example.backend.notification.entity.Notification;
import com.example.backend.notification.entity.NotificationType;
import com.example.backend.notification.repository.NotificationRepository;
import com.example.backend.teamMember.entity.TeamMember;
import com.example.backend.teamMember.entity.TeamRole;
import com.example.backend.teamMember.entity.TeamStatus;
import com.example.backend.teamMember.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final TeamMemberRepository teamMemberRepository;

    // 승인 요청 알림 (지출 등록 시 - API-016)
    // 대상: 팀의 관리자 + 총무 전원 (단, 지출 올린 작성자 본인은 제외)
    public void notifyApprovalRequest(Expense expense) {
        Long teamId = expense.getTeam().getId();
        Long writerId = expense.getUser().getId(); // 작성자 (본인은 알림 제외)

        // 관리자 + 총무 조회
        List<User> approvers = findApprovers(teamId);

        // 작성자 본인 빼고 각자에게 알림 생성
        for (User approver : approvers) {
            if (approver.getId().equals(writerId)) continue; // 본인 제외
            saveNotification(approver, expense, NotificationType.APPROVAL_REQUEST);
        }
    }

    // 승인 결과 알림 (지출 승인 시 - API-019)
    public void notifyApproved(Expense expense, User processor) {
        notifyResult(expense, processor, NotificationType.APPROVED);
    }

    // 반려 결과 알림 (지출 반려 시 - API-020)
    public void notifyRejected(Expense expense, User processor) {
        notifyResult(expense, processor, NotificationType.REJECTED);
    }

    // 결과 알림 공통 로직 (승인/반려)
    // 대상: 1) 작성자 본인  2) 처리자·작성자 제외한 나머지 관리자·총무 (중복 방지용)
    // 한 사람이 두 번 안 받게 Set으로 중복 제거 (작성자 자격 우선)
    private void notifyResult(Expense expense, User processor, NotificationType type) {
        Long teamId = expense.getTeam().getId();
        User writer = expense.getUser();        // 작성자
        // 처리한 사람 (본인은 제외). AI가 자동 처리한 경우 processor=null → 제외 대상 없음
        Long processorId = (processor != null) ? processor.getId() : null;

        // 수신자 모으기 (LinkedHashSet = 순서 유지 + 중복 자동 제거)
        Set<User> receivers = new LinkedHashSet<>();

        // 1) 작성자 본인 (무조건)
        receivers.add(writer);

        // 2) 나머지 관리자·총무 (처리자 제외, 작성자는 이미 위에서 들어감)
        for (User approver : findApprovers(teamId)) {
            if (processorId != null && approver.getId().equals(processorId)) continue; // 사람 처리자면 제외
            receivers.add(approver); // 작성자와 겹치면 Set이 자동으로 중복 제거
        }

        // 각 수신자에게 알림 생성
        for (User receiver : receivers) {
            saveNotification(receiver, expense, type);
        }
    }

    // 팀의 승인권자(관리자 + 총무) User 목록 조회 (ACCEPTED 상태만)
    private List<User> findApprovers(Long teamId) {
        List<TeamMember> members = teamMemberRepository.findByTeamIdAndStatusAndRoleIn(
                teamId,
                TeamStatus.ACCEPTED,
                List.of(TeamRole.ADMIN, TeamRole.ACCOUNTANT)
        );
        List<User> users = new ArrayList<>();
        for (TeamMember m : members) {
            users.add(m.getUser());
        }
        return users;
    }

    // 알림 1건 저장 (내부 공통)
    private void saveNotification(User receiver, Expense expense, NotificationType type) {
        Notification notification = Notification.builder()
                .user(receiver)
                .expense(expense)
                .type(type)
                .build();
        notificationRepository.save(notification);
    }

    // 알림 목록 조회 (API-036) — 로그인 유저의 안읽은 알림 전체, 최신순
    @Transactional(readOnly = true)
    public NotificationListResponse getNotifications(Long userId) {
        List<Notification> notifications =
                notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);

        List<NotificationListResponse.NotificationInfo> infos = notifications.stream()
                .map(n -> {
                    Expense expense = n.getExpense();
                    return NotificationListResponse.NotificationInfo.builder()
                            .id(n.getId())
                            .type(n.getType().name())
                            .teamId(expense != null ? expense.getTeam().getId() : null)
                            .expenseId(expense != null ? expense.getId() : null)
                            .expenseTitle(expense != null ? expense.getTitle() : null)
                            .actorName(resolveActorName(n))     // 관련 사람 이름
                            .isRead(n.getIsRead())
                            .createdAt(n.getCreatedAt().toString())
                            .build();
                })
                .collect(Collectors.toList());

        return NotificationListResponse.builder()
                .success(true)
                .notifications(infos)
                .build();
    }

    // 알림 종류에 따라 관련 사람 이름 반환
    // 요청 → 작성자 / 승인·반려 → 처리자 (AI면 null)
    private String resolveActorName(Notification n) {
        Expense expense = n.getExpense();
        if (expense == null) return null;

        return switch (n.getType()) {
            case APPROVAL_REQUEST -> expense.getUser().getName();          // 작성자
            case APPROVED, REJECTED -> expense.getApprovedBy() != null
                    ? expense.getApprovedBy().getName() : null;            // 처리자 (AI면 null)
        };
    }

    // 알림 읽음 처리 (API-037)
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        // 1. 알림 조회 (없으면 404)
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다."));

        // 2. 본인 알림인지 확인 (남의 알림 못 읽게)
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 알림만 읽음 처리할 수 있습니다.");
        }

        // 3. 읽음 처리
        notification.markAsRead();
    }
}