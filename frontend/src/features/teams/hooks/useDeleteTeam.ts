import { useState } from 'react';
import { AxiosError } from 'axios';
import { deleteTeam } from '../api/teamApi';
import { ErrorResponse } from '@/types/auth';

const useDeleteTeam = (teamId: string | undefined) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitDelete = async () => {
        if (!teamId) return { success: false as const, message: 'Team ID가 없습니다.' };

        try {
            setIsSubmitting(true);
            const response = await deleteTeam(teamId);
            return { success: true as const, message: response.data.message };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            // 다른 멤버가 남아 있으면 409로 거부됨 (먼저 내보내거나 위임해야 함)
            const message = axiosError.response?.data?.message || '모임 삭제 중 오류가 발생했습니다.';
            return { success: false as const, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitDelete };
};

export default useDeleteTeam;