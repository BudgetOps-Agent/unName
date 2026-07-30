import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { getExpenses } from "../api/teamApi";
import { ResponseExpenses } from "@/types/expense";
import { ErrorResponse } from "@/types/auth";

export type ExpenseItem = ResponseExpenses['expenses'][number];
export type ExpenseCounts = ResponseExpenses['counts'];

const emptyCounts: ExpenseCounts = { all: 0, pending: 0, approved: 0, rejected: 0 };

export const useExpenses = (teamId: string | undefined) => {

    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [counts, setCounts] = useState<ExpenseCounts>(emptyCounts);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchExpenses = useCallback(async () => {
        if (!teamId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await getExpenses(teamId);

            setExpenses(response.data.expenses);
            setCounts(response.data.counts);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || '지출 목록을 불러오는 중 오류가 발생했습니다.';

            console.error("지출 목록 조회 실패: ", errMsg);
            setExpenses([]);
            setCounts(emptyCounts);
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    return { expenses, counts, isLoading, error, refetch: fetchExpenses };
};
