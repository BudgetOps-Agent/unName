export type NotificationType = 'APPROVAL_REQUEST' | 'APPROVED' | 'REJECTED';

export interface NotificationItem {
    id: number;
    type: NotificationType;
    // 이 알림이 속한 팀 (링크 경로용). 지출이 없는 알림이면 null
    teamId: number | null;
    expenseId: number | null;
    expenseTitle: string;
    actorName: string | null;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationListResponse {
    success: boolean;
    notifications: NotificationItem[];
}

export interface MarkNotificationReadResponse {
    success: boolean;
    message: string;
}
