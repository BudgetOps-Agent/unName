import { useState } from 'react';
import { AxiosError } from 'axios';
import { createExpense } from '../api/teamApi';
import { ErrorResponse } from '@/types/auth';

export interface CreateExpenseInput {
    title: string;
    amount: string;
    expenseDate: string;
    description: string;
    receipt: File;
}

const useCreateExpense = (teamId: string | undefined) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitExpense = async (input: CreateExpenseInput) => {
        if (!teamId) return { success: false, message: 'Team ID가 없습니다.' };

        const formData = new FormData();
        formData.append('title', input.title);
        formData.append('amount', input.amount);
        formData.append('expenseDate', input.expenseDate);
        formData.append('description', input.description);
        formData.append('receiptFile', input.receipt);

        try {
            setIsSubmitting(true);
            const response = await createExpense(teamId, formData);
            return { success: true, expenseId: response.data.expenseId };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || '지출 등록 중 오류가 발생했습니다.';
            return { success: false, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitExpense };
};

export default useCreateExpense;
