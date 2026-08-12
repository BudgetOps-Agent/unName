import { useState } from 'react';
import { AxiosError } from 'axios';
import { updateExpense } from '../api/teamApi';
import { ErrorResponse } from '@/types/auth';

export interface UpdateExpenseInput {
    title: string;
    amount: string;
    description: string;
    receipt: File | null;
}

const useUpdateExpense = (expenseId: string | undefined) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitUpdate = async (input: UpdateExpenseInput) => {
        if (!expenseId) return { success: false as const, message: 'Expense ID가 없습니다.' };

        const formData = new FormData();
        formData.append('title', input.title);
        formData.append('amount', input.amount);
        formData.append('description', input.description);
        if (input.receipt) formData.append('receiptFile', input.receipt);

        try {
            setIsSubmitting(true);
            const response = await updateExpense(expenseId, formData);
            return { success: true as const, expense: response.data.expense };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || '지출 수정 중 오류가 발생했습니다.';
            return { success: false as const, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitUpdate };
};

export default useUpdateExpense;
