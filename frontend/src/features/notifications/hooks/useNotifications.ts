import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { getNotifications, markNotificationAsRead } from '../api/notificationApi';
import { NotificationItem } from '@/types/notification';
import { ErrorResponse } from '@/types/auth';

const useNotifications = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await getNotifications();

            setNotifications(response.data.notifications);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || '알림을 불러오는 중 오류가 발생했습니다.';

            setNotifications([]);
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (notificationId: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        try {
            await markNotificationAsRead(notificationId);
        } catch (err) {
            console.error('알림 읽음 처리 실패:', err);
        }
    };

    return { notifications, isLoading, error, refetch: fetchNotifications, markAsRead };
};

export default useNotifications;
