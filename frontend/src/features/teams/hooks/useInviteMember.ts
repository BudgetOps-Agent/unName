import { useState } from 'react';
import { AxiosError } from 'axios';
import { inviteMember } from '../api/teamApi';
import { ErrorResponse } from '@/types/auth';

const useInviteMember = (teamId: string | undefined) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitInvite = async (email: string) => {
        if (!teamId) return { success: false, message: 'Team ID가 없습니다.' };

        try {
            setIsSubmitting(true);
            const response = await inviteMember(teamId, email);
            return { success: true, message: response.data.message };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || '멤버 초대 중 오류가 발생했습니다.';
            return { success: false, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitInvite };
};

export default useInviteMember;
