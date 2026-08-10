import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { mypage } from '@/features/auth/api/authApi';
import { TeamRole } from '@/types/team';
import { ErrorResponse } from '@/types/auth';

const useMyTeamRole = (teamId: string | undefined) => {
    const [role, setRole] = useState<TeamRole | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    // isLoading은 최초 마운트 시 false→true→false로 바뀌어서 "아직 한 번도 안 불러온 상태"와
    // "다 불러왔는데 역할이 없는 상태"를 구분 못 함 — 접근 가드처럼 확정된 값이 필요한 곳에서 씀
    const [hasFetched, setHasFetched] = useState<boolean>(false);

    const fetchRole = useCallback(async () => {
        if (!teamId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await mypage();
            const currentTeam = response.data.teams.find((team) => String(team.teamId) === String(teamId));

            setRole(currentTeam?.role ?? null);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || '권한 정보를 불러오는 중 오류가 발생했습니다.';

            setRole(null);
            setError(errMsg);
        } finally {
            setIsLoading(false);
            setHasFetched(true);
        }
    }, [teamId]);

    useEffect(() => {
        fetchRole();
    }, [fetchRole]);

    return { role, isLoading, hasFetched, error, refetch: fetchRole };
};

export default useMyTeamRole;
