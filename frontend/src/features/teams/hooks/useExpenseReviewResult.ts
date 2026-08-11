import { useCallback, useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { getExpenseReviewResult } from '../api/teamApi';
import { ExpenseReviewResultResponse } from '@/types/expense';
import { ErrorResponse } from '@/types/auth';

export type ExpenseReview = NonNullable<ExpenseReviewResultResponse['review']>;

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 20; // 약 80초 동안 폴링 후 포기

const useExpenseReviewResult = (expenseId: string | undefined) => {
    const [review, setReview] = useState<ExpenseReview | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pollTimedOut, setPollTimedOut] = useState(false);
    const pollCountRef = useRef(0);

    const fetchReviewResult = useCallback(async () => {
        if (!expenseId) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await getExpenseReviewResult(expenseId);

            setReview(response.data.review);
        } catch (err) {
            const axiosError = err as AxiosError<ErrorResponse>;
            const errMsg = axiosError.response?.data?.message || 'AI 심사 결과를 불러오는 중 오류가 발생했습니다.';

            setReview(null);
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, [expenseId]);

    const refetch = useCallback(() => {
        pollCountRef.current = 0;
        setPollTimedOut(false);
        return fetchReviewResult();
    }, [fetchReviewResult]);

    useEffect(() => {
        pollCountRef.current = 0;
        setPollTimedOut(false);
        fetchReviewResult();
    }, [fetchReviewResult]);

    // 아직 판정 전이면 결과가 나올 때까지 주기적으로 다시 조회
    // CB-001 콜백을 프론트가 직접 받을 방법이 없어(웹소켓/SSE 없음) 폴링으로 대신함
    //
    // 판정 전은 두 가지: (1) 최초 심사 — review가 null
    //                  (2) 재심사 — 지출을 수정하면 status가 SUBMITTED로 돌아가지만
    //                      옛 심사기록이 남아있어 review는 null이 아님 (finalVerdict로 판별)
    const isAwaitingReview = !review || review.finalVerdict === 'SUBMITTED';

    useEffect(() => {
        if (!expenseId || !isAwaitingReview || pollTimedOut) return;

        const timer = setInterval(() => {
            pollCountRef.current += 1;

            if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
                clearInterval(timer);
                setPollTimedOut(true);
                return;
            }

            fetchReviewResult();
        }, POLL_INTERVAL_MS);

        return () => clearInterval(timer);
    }, [expenseId, isAwaitingReview, pollTimedOut, fetchReviewResult]);

    return { review, isLoading, error, pollTimedOut, refetch };
};

export default useExpenseReviewResult;
