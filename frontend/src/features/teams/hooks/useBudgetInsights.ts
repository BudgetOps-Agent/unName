import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { getBudgetInsights } from '../api/teamApi';
import { BudgetInsightsResponse } from '@/types/budget';
import { ErrorResponse } from '@/types/auth';

export type BudgetInsights = BudgetInsightsResponse['insights'];

const useBudgetInsights = (teamId: string | undefined, period?: string) => {
    const [insights, setInsights] = useState<BudgetInsights | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInsights = useCallback(async () => {
        if (!teamId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await getBudgetInsights(teamId, period);

            setInsights(response.data.insights);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || 'AI 예산 추천을 불러오는 중 오류가 발생했습니다.';

            setInsights(null);
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, [teamId, period]);

    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);

    return { insights, isLoading, error, refetch: fetchInsights };
};

export default useBudgetInsights;
