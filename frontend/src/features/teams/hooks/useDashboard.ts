import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { getDashboard } from '../api/teamApi';
import { DashboardResponse } from '@/types/dashboard';
import { ErrorResponse } from '@/types/auth';

export type Dashboard = DashboardResponse['dashboard'];

const useDashboard = (teamId: string | undefined) => {
    const [dashboard, setDashboard] = useState<Dashboard | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        if (!teamId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await getDashboard(teamId);

            setDashboard(response.data.dashboard);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || '대시보드 정보를 불러오는 중 오류가 발생했습니다.';

            setDashboard(null);
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return { dashboard, isLoading, error, refetch: fetchDashboard };
};

export default useDashboard;
