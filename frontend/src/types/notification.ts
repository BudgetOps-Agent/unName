export type NotificationType = 'APPROVAL_REQUEST' | 'APPROVED' | 'REJECTED';

export interface NotificationItem {
    id: number;
    type: NotificationType;
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
