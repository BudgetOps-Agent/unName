import { useState } from 'react';
import { AxiosError } from 'axios';
import { leaveTeam } from '../api/teamApi';
import { ErrorResponse } from '@/types/auth';

const useLeaveTeam = (teamId: string | undefined) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitLeave = async () => {
        if (!teamId) return { success: false as const, message: 'Team ID가 없습니다.' };

        try {
            setIsSubmitting(true);
            const response = await leaveTeam(teamId);
            return { success: true as const, message: response.data.message };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            // 관리자가 권한 위임 없이 나가려는 경우도 여기로 옴 (백엔드가 400으로 막음)
            const message = axiosError.response?.data?.message || '모임 탈퇴 중 오류가 발생했습니다.';
            return { success: false as const, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitLeave };
};

export default useLeaveTeam;