import styles from './expenseinfocard.module.css';
import { Card } from '@/shared/components/card/Card';
import { Badge } from '@/shared/components/badge/Badge';

type BadgeStyle = 'blue' | 'purple' | 'gray' | 'yellow' | 'red' | 'green' | 'orange';

export interface ExpenseInfo {
    status: string;
    statusStyle?: BadgeStyle;
    title: string;
    category: string;
    date: string;
    requester: string;
    description: string;
    amount: number;
}

interface ExpenseInfoCardProps {
    expense: ExpenseInfo;
}

const ExpenseInfoCard = ({ expense }: ExpenseInfoCardProps) => {
    const { status, statusStyle = 'green', title, category, date, requester, description, amount } = expense;

    return (
        <Card className={styles.expenseInfo} noPadding={true}>
            <div className={styles.infoHeader}>
                <div className={styles.headerLeft}>
                    <Badge text={status} style={statusStyle} />
                    <p className={styles.title}>{title}</p>
                    <p className={styles.meta}>{`${category} · ${date}`}</p>
                </div>

                <p className={styles.amount}>{`${amount.toLocaleString()}원`}</p>
            </div>

            <div className={styles.infoBody}>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>요청자</span>
                    <p className={styles.infoValue}>{requester}</p>
                </div>

                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>카테고리</span>
                    <p className={styles.infoValue}>{category}</p>
                </div>

                <div className={styles.expenseDesc}>
                    <span className={styles.infoLabel}>설명</span>
                    <p className={styles.infoValue}>{description}</p>
                </div>
            </div>
        </Card>
    )
}

export default ExpenseInfoCard
