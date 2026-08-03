import { useState } from 'react';
import { AxiosError } from 'axios';
import { updateBudget } from '../api/teamApi';
import { ErrorResponse } from '@/types/auth';

const useUpdateBudget = (teamId: string | undefined) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitBudgetUpdate = async (totalBudget: number) => {
        if (!teamId) return { success: false as const, message: 'Team ID가 없습니다.' };

        try {
            setIsSubmitting(true);
            const response = await updateBudget(teamId, totalBudget);
            return { success: true as const, budget: response.data.budget };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || '예산 수정 중 오류가 발생했습니다.';
            return { success: false as const, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitBudgetUpdate };
};

export default useUpdateBudget;
