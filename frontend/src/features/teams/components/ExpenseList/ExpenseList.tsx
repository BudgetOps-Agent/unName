import styles from './expenselist.module.css';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Card } from '@/shared/components/card/Card';
import { Badge } from '@/shared/components/badge/Badge';

type ExpenseStatus = 'SUBMITTED' | 'ESCALATED' | 'APPROVED' | 'REJECTED';

interface Expense {
    id: number;
    title: string;
    amount: number;
    status: ExpenseStatus;
    requesterName: string;
    date: string;
}

interface ExpenseListProps {
    expenses: Expense[];
}

const STATUS_LABEL: Record<ExpenseStatus, string> = {
    SUBMITTED: '대기',
    ESCALATED: '⚠ 에스컬',
    APPROVED: '승인',
    REJECTED: '반려',
}

const STATUS_BADGE_STYLE: Record<ExpenseStatus, 'yellow' | 'orange' | 'green' | 'red'> = {
    SUBMITTED: 'yellow',
    ESCALATED: 'orange',
    APPROVED: 'green',
    REJECTED: 'red',
}

const formatDate = (isoString: string) => {
    if (!isoString) return "";
    return isoString.slice(0, 10);
}

const ExpenseList = ({ expenses }: ExpenseListProps) => {

    const router = useRouter();
    const { teamId } = router.query;

    return (
        <Card noPadding={true}>
            <div className={styles.itemSection}>
                {expenses.map((expense) => (
                    <Link key={expense.id} className={styles.expenseItem} href={`/teams/${teamId}/expenses/${expense.id}`}>
                        <div className={styles.left}>
                            <div className={styles.titleSection}>
                                <p className={styles.title}>{expense.title}</p>
                                {expense.status === 'ESCALATED' && (
                                    <Badge text={STATUS_LABEL.SUBMITTED} style={STATUS_BADGE_STYLE.SUBMITTED} />
                                )}
                                <Badge
                                    text={STATUS_LABEL[expense.status]}
                                    style={STATUS_BADGE_STYLE[expense.status]}
                                    size={expense.status === 'ESCALATED' ? 'sm' : undefined}
                                />
                            </div>

                            <p className={styles.expenseInfo}>{`${expense.requesterName} · ${formatDate(expense.date)}`}</p>
                        </div>

                        <div className={styles.right}>
                            <p className={styles.expense}>{expense.amount.toLocaleString()}원</p>
                            <img src="/right-arrow.svg" alt="바로가기" />
                        </div>
                    </Link>
                ))}
            </div>
        </Card>
    )
}

export default ExpenseList
