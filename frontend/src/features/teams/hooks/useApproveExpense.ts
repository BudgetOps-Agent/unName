import { useState } from 'react';
import { AxiosError } from 'axios';
import { approveExpense } from '../api/teamApi';
import { ErrorResponse } from '@/types/auth';

const useApproveExpense = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitApprove = async (expenseId: string) => {
        try {
            setIsSubmitting(true);
            const response = await approveExpense(expenseId);
            return { success: true as const, status: response.data.status, approvedAt: response.data.approvedAt };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || '지출 승인 중 오류가 발생했습니다.';
            return { success: false as const, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitApprove };
};

export default useApproveExpense;
