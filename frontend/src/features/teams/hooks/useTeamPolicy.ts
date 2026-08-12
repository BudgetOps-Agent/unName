import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { getTeamPolicy } from '../api/teamApi';
import { Policy } from '@/types/policy';
import { ErrorResponse } from '@/types/auth';

// 현재 등록된 회칙. 미등록이면 서버가 200 + policy:null로 주므로 에러가 아니다
const useTeamPolicy = (teamId: string | undefined) => {
    const [policy, setPolicy] = useState<Policy | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    // "아직 안 불러옴"과 "불러왔는데 회칙이 없음"을 구분해야 초기값을 한 번만 채울 수 있음
    const [hasFetched, setHasFetched] = useState<boolean>(false);

    const fetchPolicy = useCallback(async () => {
        if (!teamId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await getTeamPolicy(teamId);

            setPolicy(response.data.policy);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || '회칙 정보를 불러오는 중 오류가 발생했습니다.';

            setPolicy(null);
            setError(errMsg);
        } finally {
            setIsLoading(false);
            setHasFetched(true);
        }
    }, [teamId]);

    useEffect(() => {
        fetchPolicy();
    }, [fetchPolicy]);

    return { policy, isLoading, hasFetched, error, refetch: fetchPolicy };
};

export default useTeamPolicy;