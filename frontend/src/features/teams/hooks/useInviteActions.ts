import { useCallback, useEffect, useState } from "react"
import { acceptInvite, rejectInvite } from "../api/teamApi";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/auth";

const useInviteActions = () => {
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [errorId, setErrorId] = useState<number | null>(null);

    const handleAccept = useCallback(async(memberId: number) => {
        try{
            setLoadingId(memberId);
            setError(null);
            setErrorId(null);

            await acceptInvite(memberId);

            return true;
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || '모임 수락 중 오류가 발생했습니다.';

            console.error("모임 수락 실패: ", errMsg);
            setLoadingId(null);
            setError(errMsg);
            setErrorId(memberId);

            return false
        } finally {
            setLoadingId(null);
        }
    }, []);


    const handleReject = useCallback(async (memberId: number) => {
        try {
            setLoadingId(memberId);
            setError(null);
            setErrorId(null);

            await rejectInvite(memberId);

            return true;
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || '모임 거절 중 오류가 발생했습니다.';

            console.error("모임 거절 실패: ", errMsg);
            setLoadingId(null);
            setError(errMsg);
            setErrorId(memberId);  

            return false
        } finally {
            setLoadingId(null);
        }
    }, []);

    return { loadingId, error, errorId, handleAccept, handleReject };
}
export default useInviteActions