import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { getBudget } from '../api/teamApi';
import { BudgetResponse } from '@/types/budget';
import { ErrorResponse } from '@/types/auth';

export type Budget = BudgetResponse['budget'];

const useBudget = (teamId: string | undefined) => {
    const [budget, setBudget] = useState<Budget | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBudget = useCallback(async () => {
        if (!teamId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await getBudget(teamId);

            setBudget(response.data.budget);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || '예산 정보를 불러오는 중 오류가 발생했습니다.';

            setBudget(null);
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchBudget();
    }, [fetchBudget]);

    return { budget, isLoading, error, refetch: fetchBudget };
};

export default useBudget;
