import { useState } from 'react';
import styles from './expensedetail.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import ExpenseInfoCard from '../../../components/ExpenseInfoCard/ExpenseInfoCard';
import ReceiptCard from '../../../components/ReceiptCard/ReceiptCard';
import AIReviewCard from '../../../components/AIReviewCard/AIReviewCard';
import useExpenseDetail from '../../../hooks/useExpenseDetail';

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
    IT_인프라: 'IT/인프라',
};

const ExpenseDetail = () => {

    const router = useRouter();
    const { teamId, expenseId } = router.query;
    const validExpenseId = typeof expenseId === 'string' ? expenseId : undefined;

    const { expense, isLoading, error, refetch } = useExpenseDetail(validExpenseId);

    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

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

    const mappedExpense = {
        status: STATUS_LABEL[expense.status] ?? expense.status,
        title: expense.title,
        category: CATEGORY_LABEL[expense.category] ?? expense.category,
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
            <Link href={`/teams/${teamId}/expenses`} className={`link-back ${styles.backLink}`}>
                <span>지출 내역</span>
            </Link>

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
                            />
                            <Button
                                className={styles.confirmRejectBtn}
                                text="반려하기"
                                style="tertiary"
                                disabled={!rejectReason.trim()}
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
                            text="승인하기"
                            style="tertiary"
                        />
                    </div>
                )
            )}
        </div>
    )
}

export default ExpenseDetail
