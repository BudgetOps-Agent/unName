import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { getAiSummary } from '../api/teamApi';
import { ErrorResponse } from '@/types/auth';

const useAiSummary = (teamId: string | undefined) => {
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAiSummary = useCallback(async () => {
        if (!teamId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await getAiSummary(teamId);

            setSummary(response.data.summary);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || 'AI 요약을 불러오는 중 오류가 발생했습니다.';

            setSummary(null);
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchAiSummary();
    }, [fetchAiSummary]);

    return { summary, isLoading, error, refetch: fetchAiSummary };
};

export default useAiSummary;
