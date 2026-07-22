import styles from './expenselist.module.css';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Card } from '@/shared/components/card/Card';
import { Badge } from '@/shared/components/badge/Badge';

interface Expense {
    id: number;
    title: string;
    status: string;
    name: string;
    expense: number;
    escalation: boolean;
    createdAt: string;
}

interface ExpenseListProps {
    expenses: Expense[];
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
                                <Badge 
                                    text={expense.status}
                                    style={
                                        expense.status === '승인' ? 'green' 
                                        : expense.status === '대기' ? 'yellow' 
                                        : expense.status === '반려' ? 'red' 
                                        : 'gray'
                                    }
                                />
                            </div>

                            <p className={styles.expenseInfo}>{`${expense.name} · ${expense.createdAt}`}</p>
                        </div>

                        <div className={styles.right}>
                            <p className={styles.expense}>{expense.expense.toLocaleString()}원</p>
                            <img src="/right-arrow.svg" alt="바로가기" />
                        </div>
                    </Link>
                ))}
            </div>
        </Card>
    )
}

export default ExpenseList