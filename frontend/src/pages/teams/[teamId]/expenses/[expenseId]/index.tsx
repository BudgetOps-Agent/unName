import styles from './expensedetail.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ExpenseInfoCard from '@/features/teams/components/ExpenseInfoCard/ExpenseInfoCard';
import ReceiptCard from '@/features/teams/components/ReceiptCard/ReceiptCard';
import AIReviewCard from '@/features/teams/components/AIReviewCard/AIReviewCard';

const aiReviewers = [
    {
        id: 1,
        icon: '📄',
        verdict: 'PASS' as const,
        opinion: '회칙 제3조 회의비 항목에 해당하며 지출 한도 내에 있어요.',
        reason: '회의비 월 한도 100,000원 중 45,000원 사용 (45%)',
    },
    {
        id: 2,
        icon: '💰',
        verdict: 'PASS' as const,
        opinion: '회의비 카테고리 잔여 예산이 충분해요.',
        reason: '회의비 잔여 455,000원, 요청액 45,000원 (9.9%)',
    },
    {
        id: 3,
        icon: '🔍',
        verdict: 'PASS' as const,
        opinion: '정상적인 지출 패턴이에요.',
        reason: '유사 지출 대비 금액·빈도 모두 정상 범위',
    },
];

const expense = {
    status: '승인됨',
    statusStyle: 'green' as const,
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

    return (
        <div className={styles.detailContainer}>
            <Link href={`/teams/${teamId}/expenses`} className={`link-back ${styles.backLink}`}>
                <span>지출 내역</span>
            </Link>

            <ExpenseInfoCard expense={expense} />

            <ReceiptCard receiptUrl={receiptUrl} />

            <AIReviewCard
                reviewers={aiReviewers}
                finalVerdict="AI 승인"
                processor="AI 에이전트"
                category="회의비"
            />
        </div>
    )
}

export default ExpenseDetail
