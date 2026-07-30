import { useState } from 'react';
import { AxiosError } from 'axios';
import { removeMember } from '../api/teamApi';
import { ErrorResponse } from '@/types/auth';

const useRemoveMember = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitRemove = async (memberId: number) => {
        try {
            setIsSubmitting(true);
            const response = await removeMember(memberId);
            return { success: true, message: response.data.message };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || '멤버 추방 중 오류가 발생했습니다.';
            return { success: false, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitRemove };
};

export default useRemoveMember;
