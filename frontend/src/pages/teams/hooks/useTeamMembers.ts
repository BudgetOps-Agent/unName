import axios, { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import { Member, UseTeamMembersResult } from '@/types/member';

export const useTeamMembers = (teamId: string | undefined) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchMembers = async (): Promise<UseTeamMembersResult> => {
        if (!teamId) {
            return {
                success: false,
                message: 'Team ID가 없습니다.'
            };
        }

        try {
            setIsLoading(true);

            const response = await axios.get<Member[]>(`/api/teams/${teamId}/members`);
            
            setMembers(response.data);

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            const axiosError = error as AxiosError<{message: string}>;

            return {
                success: false,
                status: axiosError.response?.status,
                message: axiosError.response?.data?.message
            };
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [teamId]);


    return { members, isLoading, refetch: fetchMembers };
};