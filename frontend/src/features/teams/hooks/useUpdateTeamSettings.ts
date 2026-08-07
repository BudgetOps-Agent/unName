import { useState } from 'react';
import { AxiosError } from 'axios';
import { updateTeamSettings } from '../api/teamApi';
import { UpdateTeamSettingsRequest } from '@/types/team';
import { ErrorResponse } from '@/types/auth';

const useUpdateTeamSettings = (teamId: string | undefined) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitSettings = async (input: UpdateTeamSettingsRequest) => {
        if (!teamId) return { success: false as const, message: 'Team ID가 없습니다.' };

        try {
            setIsSubmitting(true);
            await updateTeamSettings(teamId, input);
            return { success: true as const };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || '설정 저장 중 오류가 발생했습니다.';
            return { success: false as const, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitSettings };
};

export default useUpdateTeamSettings;
