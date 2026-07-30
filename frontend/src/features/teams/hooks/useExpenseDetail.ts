import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { getExpenseDetail } from '../api/teamApi';
import { ExpenseDetailResponse } from '@/types/expense';
import { ErrorResponse } from '@/types/auth';

export type ExpenseDetail = ExpenseDetailResponse['expense'];

const useExpenseDetail = (expenseId: string | undefined) => {
    const [expense, setExpense] = useState<ExpenseDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchExpenseDetail = useCallback(async () => {
        if (!expenseId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await getExpenseDetail(expenseId);

            setExpense(response.data.expense);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || '지출 상세 정보를 불러오는 중 오류가 발생했습니다.';

            setExpense(null);
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, [expenseId]);

    useEffect(() => {
        fetchExpenseDetail();
    }, [fetchExpenseDetail]);

    return { expense, isLoading, error, refetch: fetchExpenseDetail };
};

export default useExpenseDetail;
