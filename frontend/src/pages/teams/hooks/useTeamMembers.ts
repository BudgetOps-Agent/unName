import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import { getTeamMembers } from '../api/teamApi';
import { Member, UseTeamMembersResult } from '@/types/member';

export const useTeamMembers = (teamId: string | undefined) => {

    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = async (): Promise<UseTeamMembersResult> => {
        if (!teamId) {
            return {
                success: false,
                message: 'Team ID가 없습니다.'
            };
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await getTeamMembers(teamId);
            
            setMembers(response.data);

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            const axiosError = error as AxiosError<{message: string}>;
            const errMsg = axiosError.response?.data?.message || '멤버 목록을 불러오는 중 오류가 발생했습니다.';

            setError(errMsg);

            return {
                success: false,
                status: axiosError.response?.status,
                message: errMsg
            };
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (teamId) {
            fetchMembers();
        }
    }, [teamId]);


    return { members, isLoading, error, refetch: fetchMembers };
};