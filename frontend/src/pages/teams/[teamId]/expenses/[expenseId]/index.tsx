import { useState } from 'react';
import styles from './expensedetail.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import useExpenseDetail from '@/features/teams/hooks/useExpenseDetail';
import useExpenseReviewResult from '@/features/teams/hooks/useExpenseReviewResult';
import useApproveExpense from '@/features/teams/hooks/useApproveExpense';
import useRejectExpense from '@/features/teams/hooks/useRejectExpense';
import useDeleteExpense from '@/features/teams/hooks/useDeleteExpense';
import ExpenseInfoCard from '@/features/teams/components/ExpenseInfoCard/ExpenseInfoCard';
import ReceiptCard from '@/features/teams/components/ReceiptCard/ReceiptCard';
import AIReviewCard from '@/features/teams/components/AIReviewCard/AIReviewCard';
import DeleteExpenseCard from '@/features/teams/components/DeleteExpenseCard/DeleteExpenseCard';
import LoadingText from '@/shared/components/loading/LoadingText';
import { CATEGORY_LABEL } from '@/features/teams/constants/category';

const STATUS_LABEL: Record<string, string> = {
    SUBMITTED: '대기',
    ESCALATED: '대기',
    APPROVED: '승인',
    REJECTED: '반려',
};

const ExpenseDetail = () => {

    const router = useRouter();
    const { teamId, expenseId } = router.query;
    const validExpenseId = typeof expenseId === 'string' ? expenseId : undefined;

    const { expense, isLoading, error, refetch } = useExpenseDetail(validExpenseId);
    const { review, pollTimedOut: reviewPollTimedOut, refetch: refetchReview } = useExpenseReviewResult(validExpenseId);
    const { isSubmitting: isApproving, submitApprove } = useApproveExpense();
    const { isSubmitting: isRejectingSubmit, submitReject } = useRejectExpense();
    const { isSubmitting: isDeleting, submitDelete } = useDeleteExpense();

    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // 재심사 중이면 옛 심사기록이 남아 review는 null이 아니지만 finalVerdict가 SUBMITTED로 돌아감.
    // 두 경우(최초 심사·재심사)를 함께 "아직 판정 전"으로 본다
    const isReviewDone = !!review && review.finalVerdict !== 'SUBMITTED';

    const handleApprove = async () => {
        if (!validExpenseId) return;

        const result = await submitApprove(validExpenseId);

        if (result.success) {
            refetch();
            refetchReview();
        } else {
            alert(result.message);
        }
    };

    const handleReject = async () => {
        if (!validExpenseId || !rejectReason.trim()) return;

        const result = await submitReject(validExpenseId, rejectReason.trim());

        if (result.success) {
            setIsRejecting(false);
            setRejectReason('');
            refetch();
            refetchReview();
        } else {
            alert(result.message);
        }
    };

    const handleDelete = async () => {
        if (!validExpenseId) return;

        const result = await submitDelete(validExpenseId);

        if (result.success) {
            router.push(`/teams/${teamId}/expenses`);
        } else {
            alert(result.message);
        }
    };

    if (isLoading || !expense) {
        return (
            <div className={styles.detailContainer}>
                <Link href={`/teams/${teamId}/expenses`} className={`link-back ${styles.backLink}`}>
                    <span>지출 내역</span>
                </Link>

                {error && (
                    <Card className={styles.errorCard}>
                        <div className={styles.errorContainer}>
                            <p className={styles.errorTextTitle}>⚠️ 지출 정보를 불러오지 못했습니다</p>
                            <p className={styles.errorTextSub}>{error}</p>
                            <Button text="다시 시도" onClick={() => refetch()} style="tertiary" size="md" />
                        </div>
                    </Card>
                )}
            </div>
        );
    }

    const category = expense.category;

    const mappedExpense = {
        status: STATUS_LABEL[expense.status] ?? expense.status,
        title: expense.title,
        category: category ? (CATEGORY_LABEL[category] ?? category) : '-',
        date: expense.createdAt.slice(0, 10),
        expenseDate: expense.expenseDate,
        requester: expense.requesterName,
        description: expense.description ?? '',
        amount: expense.amount,
        rejectReason: expense.rejectReason ?? undefined,
    };

    const receiptUrl = expense.receiptFileUrl
        ? `${(process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '')}${expense.receiptFileUrl}`
        : null;

    return (
        <div className={styles.detailContainer}>
            <div className={styles.topBar}>
                <Link href={`/teams/${teamId}/expenses`} className={`link-back ${styles.backLink}`}>
                    <span>지출 내역</span>
                </Link>

                {(expense.canEdit || expense.canDelete) && (
                    <div className={styles.topBarActions}>
                        {expense.canEdit && (
                            <Button
                                className={styles.editTriggerBtn}
                                text="수정"
                                style="tertiary"
                                onClick={() => router.push(`/teams/${teamId}/expenses/new?edit=${validExpenseId}`)}
                            />
                        )}
                        {expense.canDelete && (
                            <Button
                                className={styles.deleteTriggerBtn}
                                text="삭제"
                                style="tertiary"
                                onClick={() => setIsDeleteModalOpen(true)}
                            />
                        )}
                    </div>
                )}
            </div>

            {isDeleteModalOpen && (
                <div className={styles.modalOverlay}>
                    <DeleteExpenseCard
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDelete}
                        isSubmitting={isDeleting}
                    />
                </div>
            )}

            <ExpenseInfoCard expense={mappedExpense} />

            <ReceiptCard receiptUrl={receiptUrl} />

            {/* SUBMITTED면 아직 판정 전 — 지출을 수정하면 재심사가 걸리는데 옛 심사기록은 남아있어서
                review가 null이 아님. 이때 옛 결과 대신 "심사 중" 안내를 보여준다 */}
            {isReviewDone ? (
                <AIReviewCard
                    reviewers={review.reviewers}
                    finalVerdict={review.finalVerdict}
                    processType={review.processType}
                    processor={review.processor}
                    category={CATEGORY_LABEL[review.category] ?? review.category}
                    escalationReason={review.escalationReason}
                />
            ) : (
                <Card className={styles.reviewPendingCard}>
                    {reviewPollTimedOut ? (
                        <>
                            <p className={styles.reviewPendingText}>ⓘ AI 심사가 예상보다 오래 걸리고 있어요.</p>
                            <Button text="다시 확인" onClick={() => refetchReview()} style="tertiary" size="md" />
                        </>
                    ) : (
                        /* 마침표 기준으로 줄이 나뉘도록 문장별로 감쌈 (모바일에서만 줄바꿈) */
                        <LoadingText
                            text={
                                <>
                                    <span className={styles.pendingLine}>AI가 아직 심사 중이에요.</span>{' '}
                                    <span className={styles.pendingLine}>잠시 후 자동으로 갱신돼요.</span>
                                </>
                            }
                        />
                    )}
                </Card>
            )}

            {/* AI 심사가 끝나기 전에 승인·반려하면 AI가 채워줄 카테고리가 비어버리고,
                그런 지출은 예산 관리 탭의 카테고리별 도넛 차트에 잡히지 않는다.
                그래서 관리자·총무여도 심사 결과가 나온 뒤에만 버튼을 노출한다 */}
            {isReviewDone && (expense.canApprove || expense.canReject) && (
                isRejecting ? (
                    <Card className={styles.rejectCard}>
                        <p className={styles.rejectLabel}>반려 사유를 알려 주세요</p>
                        <textarea
                            className={styles.rejectTextarea}
                            placeholder="요청자에게 전달할 사유를 적어 주세요"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className={styles.actionButtons}>
                            <Button
                                className={styles.cancelBtn}
                                text="취소"
                                style="secondary"
                                onClick={() => setIsRejecting(false)}
                                disabled={isRejectingSubmit}
                            />
                            <Button
                                className={styles.confirmRejectBtn}
                                text={isRejectingSubmit ? '처리 중...' : '반려하기'}
                                style="tertiary"
                                disabled={!rejectReason.trim() || isRejectingSubmit}
                                onClick={handleReject}
                            />
                        </div>
                    </Card>
                ) : (
                    <div className={styles.actionButtons}>
                        {expense.canReject && (
                            <Button
                                className={styles.rejectToggleBtn}
                                text="반려"
                                style="ghost"
                                onClick={() => setIsRejecting(true)}
                            />
                        )}
                        {expense.canApprove && (
                            <Button
                                className={styles.approveBtn}
                                text={isApproving ? '처리 중...' : '승인하기'}
                                style="tertiary"
                                disabled={isApproving}
                                onClick={handleApprove}
                            />
                        )}
                    </div>
                )
            )}
        </div>
    )
}

export default ExpenseDetail
