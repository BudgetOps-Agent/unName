import { useState } from 'react';
import styles from './expensedetail.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import useExpenseDetail from '@/features/teams/hooks/useExpenseDetail';
import useApproveExpense from '@/features/teams/hooks/useApproveExpense';
import useRejectExpense from '@/features/teams/hooks/useRejectExpense';
import useDeleteExpense from '@/features/teams/hooks/useDeleteExpense';
import ExpenseInfoCard from '@/features/teams/components/ExpenseInfoCard/ExpenseInfoCard';
import ReceiptCard from '@/features/teams/components/ReceiptCard/ReceiptCard';
import AIReviewCard from '@/features/teams/components/AIReviewCard/AIReviewCard';
import DeleteExpenseCard from '@/features/teams/components/DeleteExpenseCard/DeleteExpenseCard';

const aiReviewers = [
    {
        id: 1,
        verdict: 'HOLD' as const,
        opinion: '회칙 제3조 회의비 항목에 해당하며 지출 한도 내에 있어요.',
        reason: '회의비 월 한도 100,000원 중 45,000원 사용 (45%)',
    },
    {
        id: 2,
        verdict: 'FAIL' as const,
        opinion: '회의비 카테고리 잔여 예산이 충분해요.',
        reason: '회의비 잔여 455,000원, 요청액 45,000원 (9.9%)',
    },
    {
        id: 3,
        verdict: 'PASS' as const,
        opinion: '정상적인 지출 패턴이에요.',
        reason: '유사 지출 대비 금액·빈도 모두 정상 범위',
    },
];

const STATUS_LABEL: Record<string, string> = {
    SUBMITTED: '대기',
    ESCALATED: '대기',
    APPROVED: '승인',
    REJECTED: '반려',
};

const CATEGORY_LABEL: Record<string, string> = {
    회의: '회의',
    IT_인프라: 'IT/인프라',
    교육: '교육',
    식비: '식비',
    교통: '교통',
    장소_대관: '장소/대관',
    비품: '비품',
    행사_활동: '행사/활동',
    기타: '기타',
};

const ExpenseDetail = () => {

    const router = useRouter();
    const { teamId, expenseId } = router.query;
    const validExpenseId = typeof expenseId === 'string' ? expenseId : undefined;

    const { expense, isLoading, error, refetch } = useExpenseDetail(validExpenseId);
    const { isSubmitting: isApproving, submitApprove } = useApproveExpense();
    const { isSubmitting: isRejectingSubmit, submitReject } = useRejectExpense();
    const { isSubmitting: isDeleting, submitDelete } = useDeleteExpense();

    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleApprove = async () => {
        if (!validExpenseId) return;

        const result = await submitApprove(validExpenseId);

        if (result.success) {
            refetch();
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
                            <Button className={styles.errorBtn} text="다시 시도" onClick={() => refetch()} style="tertiary" />
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
        requester: expense.requesterName,
        description: expense.description ?? '',
        amount: expense.amount,
        rejectReason: expense.rejectReason ?? undefined,
    };

    const receiptUrl = expense.receiptFileUrl
        ? `${process.env.NEXT_PUBLIC_API_URL}${expense.receiptFileUrl}`
        : null;

    return (
        <div className={styles.detailContainer}>
            <div className={styles.topBar}>
                <Link href={`/teams/${teamId}/expenses`} className={`link-back ${styles.backLink}`}>
                    <span>지출 내역</span>
                </Link>

                {mappedExpense.status === '대기' && (
                    <div className={styles.topBarActions}>
                        <Button
                            className={styles.editTriggerBtn}
                            text="수정"
                            style="tertiary"
                            onClick={() => router.push(`/teams/${teamId}/expenses/new?edit=${validExpenseId}`)}
                        />
                        <Button
                            className={styles.deleteTriggerBtn}
                            text="삭제"
                            style="tertiary"
                            onClick={() => setIsDeleteModalOpen(true)}
                        />
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

            <AIReviewCard
                reviewers={aiReviewers}
                finalVerdict="APPROVED"
                processType="ESCALATED"
                processor="AI 에이전트"
                category="회의비"
            />

            {mappedExpense.status === '대기' && (
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
                        <Button
                            className={styles.rejectToggleBtn}
                            text="반려"
                            style="ghost"
                            onClick={() => setIsRejecting(true)}
                        />
                        <Button
                            className={styles.approveBtn}
                            text={isApproving ? '처리 중...' : '승인하기'}
                            style="tertiary"
                            disabled={isApproving}
                            onClick={handleApprove}
                        />
                    </div>
                )
            )}
        </div>
    )
}

export default ExpenseDetail
