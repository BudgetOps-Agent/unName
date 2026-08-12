import { useState } from 'react';
import { AxiosError } from 'axios';
import { rejectExpense } from '../api/teamApi';
import { ErrorResponse } from '@/types/auth';

const useRejectExpense = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitReject = async (expenseId: string, rejectReason: string) => {
        try {
            setIsSubmitting(true);
            const response = await rejectExpense(expenseId, rejectReason);
            return { success: true as const, status: response.data.status, approvedAt: response.data.approvedAt };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || '지출 반려 중 오류가 발생했습니다.';
            return { success: false as const, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitReject };
};

export default useRejectExpense;
