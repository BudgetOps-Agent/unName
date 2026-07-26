import { useCallback, useEffect, useState } from "react";
import { getMyTeams } from "../api/teamApi";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/auth";

interface Group {
    id: number;
    name: string;
    member: number;
    role: string;
    budget: number;
    usedBudget: number;
}

interface InviteInfo {
    id: number;
    teamName: string;
    inviteAt: string;
    inviterName: string;
}

const ROLE_LABEL: Record<string, string> = {
    ADMIN: "관리자",
    ACCOUNTANT: "총무",
    MEMBER: "멤버",
}

const useMyTeams = () => {

    const [groupInfo, setGroupInfo] = useState<Group[]>([]);
    const [inviteInfo, setInviteInfo] = useState<InviteInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMyTeams = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await getMyTeams();

            const mapped = response.data.teams.map((team) => ({
                id: team.id,
                name: team.name,
                member: team.memberCount,
                role: ROLE_LABEL[team.role] ?? team.role,
                budget: team.totalBudget,
                usedBudget: team.usedBudget,
            }));

            setGroupInfo(mapped);
            setInviteInfo(response.data.pending);

            return {
                success: true,
                data: mapped
            };
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || '모임 목록을 불러오는 중 오류가 발생했습니다.';

            console.error("내 모임 목록 조회 실패: ", errMsg);
            setGroupInfo([]);
            setInviteInfo([]);
            setError(errMsg);

            return {
                success: false,
                message: errMsg
            };
        } finally {
            setIsLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchMyTeams();
    }, [fetchMyTeams]);

    return { groupInfo, inviteInfo, isLoading, error, refetch: fetchMyTeams };
}
export default useMyTeams