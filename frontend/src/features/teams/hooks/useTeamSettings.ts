import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { getTeamSettings } from '../api/teamApi';
import { TeamSettings } from '@/types/team';
import { ErrorResponse } from '@/types/auth';

// 회비·승인정책의 현재 저장값 (회칙·정책 관리 화면 초기값 채우기용)
const useTeamSettings = (teamId: string | undefined) => {
    const [settings, setSettings] = useState<TeamSettings | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        if (!teamId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await getTeamSettings(teamId);

            setSettings(response.data.settings);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || '설정 정보를 불러오는 중 오류가 발생했습니다.';

            setSettings(null);
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return { settings, isLoading, error, refetch: fetchSettings };
};

export default useTeamSettings;