import { useState } from 'react';
import { AxiosError } from 'axios';
import { deleteExpense } from '../api/teamApi';
import { ErrorResponse } from '@/types/auth';

const useDeleteExpense = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitDelete = async (expenseId: string) => {
        try {
            setIsSubmitting(true);
            const response = await deleteExpense(expenseId);
            return { success: true as const, message: response.data.message };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || '지출 삭제 중 오류가 발생했습니다.';
            return { success: false as const, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitDelete };
};

export default useDeleteExpense;
