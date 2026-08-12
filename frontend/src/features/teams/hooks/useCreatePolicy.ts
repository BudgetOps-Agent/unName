import { useState } from 'react';
import { AxiosError } from 'axios';
import { createPolicy } from '../api/teamApi';
import { PolicyType } from '@/types/policy';
import { ErrorResponse } from '@/types/auth';

export interface CreatePolicyInput {
    policyType: PolicyType;
    content?: string;
    file?: File | null;
}

const useCreatePolicy = (teamId: string | undefined) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitPolicy = async (input: CreatePolicyInput) => {
        if (!teamId) return { success: false as const, message: 'Team ID가 없습니다.' };

        const formData = new FormData();
        formData.append('policyType', input.policyType);
        if (input.content) formData.append('content', input.content);
        if (input.file) formData.append('file', input.file);

        try {
            setIsSubmitting(true);
            const response = await createPolicy(teamId, formData);
            return { success: true as const, policyId: response.data.policyId };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || '회칙 등록 중 오류가 발생했습니다.';
            return { success: false as const, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitPolicy };
};

export default useCreatePolicy;
