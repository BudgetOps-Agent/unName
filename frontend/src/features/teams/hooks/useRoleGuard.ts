import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useMyTeamRole from './useMyTeamRole';
import { TeamRole } from '@/types/team';

// URL 직접 접근으로 사이드바 숨김을 우회하는 걸 막기 위한 페이지 단위 접근 가드
const useRoleGuard = (teamId: string | undefined, allowedRoles: TeamRole[]) => {
    const router = useRouter();
    const { role, hasFetched } = useMyTeamRole(teamId);

    const isChecking = !teamId || !hasFetched;
    const isAllowed = role !== null && allowedRoles.includes(role);

    useEffect(() => {
        if (isChecking || isAllowed || !teamId) return;

        alert('접근 권한이 없어요.');
        router.replace(`/teams/${teamId}/dashboard`);
    }, [isChecking, isAllowed, teamId, router]);

    // role도 함께 반환 — 페이지 안에서 역할별로 탭·버튼을 가를 때 mypage를 또 호출하지 않도록
    return { isChecking, isAllowed, role };
};

export default useRoleGuard;
