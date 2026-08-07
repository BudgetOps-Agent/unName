import api from "@/shared/api/api";
import { NotificationListResponse, MarkNotificationReadResponse } from "@/types/notification";
import { AxiosResponse } from "axios";

export const getNotifications = (): Promise<AxiosResponse<NotificationListResponse>> => {
  return api.get<NotificationListResponse>('/api/notifications');
}

export const markNotificationAsRead = (notificationId: number): Promise<AxiosResponse<MarkNotificationReadResponse>> => {
  return api.patch<MarkNotificationReadResponse>(`/api/notifications/${notificationId}/read`);
}
