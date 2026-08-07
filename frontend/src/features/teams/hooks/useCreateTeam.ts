import { useState } from 'react';
import { AxiosError } from 'axios';
import { createTeam } from '../api/teamApi';
import { CreateTeamRequest } from '@/types/team';
import { ErrorResponse } from '@/types/auth';

const useCreateTeam = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitTeam = async (input: CreateTeamRequest) => {
        try {
            setIsSubmitting(true);
            const response = await createTeam(input);
            return { success: true as const, team: response.data.team };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || '모임 생성 중 오류가 발생했습니다.';
            return { success: false as const, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitTeam };
};

export default useCreateTeam;
