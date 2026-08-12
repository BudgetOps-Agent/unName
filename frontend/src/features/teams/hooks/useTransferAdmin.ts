import { useState } from 'react';
import { AxiosError } from 'axios';
import { transferAdmin } from '../api/teamApi';
import { ErrorResponse } from '@/types/auth';
import { useTeamRoleStore } from '@/store/teamRoleStore';

const useTransferAdmin = (teamId: string | undefined) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const refreshRole = useTeamRoleStore((state) => state.refreshRole);

    const submitTransfer = async (newMemberId: number) => {
        if (!teamId) return { success: false, message: 'Team ID가 없습니다.' };

        try {
            setIsSubmitting(true);
            const response = await transferAdmin(teamId, newMemberId);
            // 위임한 본인은 관리자에서 내려오므로 헤더·사이드바를 다시 읽게 함
            refreshRole();
            return { success: true, message: response.data.message };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || '권한 위임 중 오류가 발생했습니다.';
            return { success: false, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitTransfer };
};

export default useTransferAdmin;
