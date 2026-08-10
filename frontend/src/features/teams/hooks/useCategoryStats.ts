import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { getCategoryStats } from '../api/teamApi';
import { CategoryStatsResponse } from '@/types/expense';
import { ErrorResponse } from '@/types/auth';

export type CategoryStat = CategoryStatsResponse['statistics'][number];

const useCategoryStats = (teamId: string | undefined) => {
    const [statistics, setStatistics] = useState<CategoryStat[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategoryStats = useCallback(async () => {
        if (!teamId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await getCategoryStats(teamId);

            setStatistics(response.data.statistics);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || '카테고리별 지출 통계를 불러오는 중 오류가 발생했습니다.';

            setStatistics([]);
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchCategoryStats();
    }, [fetchCategoryStats]);

    return { statistics, isLoading, error, refetch: fetchCategoryStats };
};

export default useCategoryStats;
