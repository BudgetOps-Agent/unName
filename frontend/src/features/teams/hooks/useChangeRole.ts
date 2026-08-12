import { useState } from 'react';
import { AxiosError } from 'axios';
import { changeRole } from '../api/teamApi';
import { ErrorResponse } from '@/types/auth';
import { useTeamRoleStore } from '@/store/teamRoleStore';

const useChangeRole = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const refreshRole = useTeamRoleStore((state) => state.refreshRole);

    const submitChangeRole = async (memberId: number, role: 'ACCOUNTANT' | 'MEMBER') => {
        try {
            setIsSubmitting(true);
            const response = await changeRole(memberId, role);
            // 헤더 역할 뱃지·사이드바 메뉴가 새 권한을 다시 읽도록 신호를 올림
            refreshRole();
            return { success: true, member: response.data.member };
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const message = axiosError.response?.data?.message || '권한 변경 중 오류가 발생했습니다.';
            return { success: false, message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitChangeRole };
};

export default useChangeRole;
