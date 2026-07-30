import api from '@/shared/api/api';
import { AxiosError } from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { ResponseMyPage } from '@/types/mypage';

export type MyPageUser = ResponseMyPage['user'];
export type MyPageTeams = ResponseMyPage['teams'][number];

export const useMyPage = () => {
    const [user, setUser] = useState<MyPageUser | null>(null);
    const [teams, setTeams] = useState<MyPageTeams[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMyPageData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get<ResponseMyPage>('/api/user/me');

            if (response.data.success) {
                setUser(response.data.user);
                setTeams(response.data.teams);
            }
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            const errMsg = axiosError.response?.data?.message ||
                '마이페이지 정보를 불러오지 못했습니다.';
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyPageData();
    }, [fetchMyPageData]);

    return {
        user,
        teams,
        isLoading,
        error,
        refetch: fetchMyPageData,
    };
};