import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { getMonthlyStats } from '../api/teamApi';
import { MonthlyStat } from '@/types/dashboard';
import { ErrorResponse } from '@/types/auth';

const useMonthlyStats = (teamId: string | undefined) => {
    const [statistics, setStatistics] = useState<MonthlyStat[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMonthlyStats = useCallback(async () => {
        if (!teamId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await getMonthlyStats(teamId);

            setStatistics(response.data.statistics);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || '월별 지출 통계를 불러오는 중 오류가 발생했습니다.';

            setStatistics([]);
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchMonthlyStats();
    }, [fetchMonthlyStats]);

    return { statistics, isLoading, error, refetch: fetchMonthlyStats };
};

export default useMonthlyStats;
