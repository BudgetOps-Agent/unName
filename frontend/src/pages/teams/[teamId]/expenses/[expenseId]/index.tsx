import { useState } from 'react';
import styles from './expensedetail.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import ExpenseInfoCard from '../../../components/ExpenseInfoCard/ExpenseInfoCard';
import ReceiptCard from '../../../components/ReceiptCard/ReceiptCard';
import AIReviewCard from '../../../components/AIReviewCard/AIReviewCard';

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

const expense = {
    status: '대기',
    title: '정기 회의 다과비',
    category: '회의',
    date: '2025-01-15',
    requester: '박지호',
    description: '1월 정기 회의 다과비용.',
    amount: 45000,
};

const ExpenseDetail = () => {

    const router = useRouter();
    const { teamId } = router.query;

    const receiptUrl: string | null = null;

    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    return (
        <div className={styles.detailContainer}>
            <Link href={`/teams/${teamId}/expenses`} className={`link-back ${styles.backLink}`}>
                <span>지출 내역</span>
            </Link>

            <ExpenseInfoCard expense={expense} />

            <ReceiptCard receiptUrl={receiptUrl} />

            <AIReviewCard
                reviewers={aiReviewers}
                finalVerdict="APPROVED"
                processType="ESCALATED"
                processor="AI 에이전트"
                category="회의비"
            />

            {expense.status === '대기' && (
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
