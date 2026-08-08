import { useState } from 'react';
import { AxiosError } from 'axios';
import { recommendPolicy } from '../api/teamApi';
import { ErrorResponse } from '@/types/auth';

const useRecommendPolicy = () => {
    const [isLoading, setIsLoading] = useState(false);

    const fetchRecommendation = async (teamId: number) => {
        try {
            setIsLoading(true);
            const response = await recommendPolicy(teamId);
            return { success: true as const, rules: response.data.rules };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || 'AI 초안 생성 중 오류가 발생했습니다.';
            return { success: false as const, message };
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, fetchRecommendation };
};

export default useRecommendPolicy;
