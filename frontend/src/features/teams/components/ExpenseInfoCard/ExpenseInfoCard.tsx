import styles from './expenseinfocard.module.css';
import { Card } from '@/shared/components/card/Card';
import { Badge } from '@/shared/components/badge/Badge';

type BadgeStyle = 'blue' | 'purple' | 'gray' | 'yellow' | 'red' | 'green' | 'orange';

const STATUS_BADGE_STYLE: Record<string, BadgeStyle> = {
    '승인': 'green',
    '대기': 'yellow',
    '반려': 'red',
};

export interface ExpenseInfo {
    status: string;
    statusStyle?: BadgeStyle;
    title: string;
    category: string;
    date: string;
    expenseDate: string;
    requester: string;
    description: string;
    amount: number;
    rejectReason?: string;
}

interface ExpenseInfoCardProps {
    expense: ExpenseInfo;
}

const ExpenseInfoCard = ({ expense }: ExpenseInfoCardProps) => {
    const { status, statusStyle, title, category, date, expenseDate, requester, description, amount, rejectReason } = expense;
    const badgeStyle = statusStyle ?? STATUS_BADGE_STYLE[status] ?? 'gray';

    return (
        <Card className={styles.expenseInfo} noPadding={true}>
            <div className={styles.infoHeader}>
                <div className={styles.headerLeft}>
                    <Badge text={status} style={badgeStyle} />
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

                <div className={`${styles.infoRow} ${styles.dateRow}`}>
                    <span className={styles.infoLabel}>지출 발생일</span>
                    <p className={styles.infoValue}>{expenseDate}</p>
                </div>

                <div className={`${styles.infoRow} ${styles.categoryRow}`}>
                    <span className={styles.infoLabel}>카테고리</span>
                    <p className={styles.infoValue}>{category}</p>
                </div>

                <div className={styles.expenseDesc}>
                    <span className={styles.descLabel}>설명</span>
                    <p className={styles.descValue}>{description}</p>
                </div>

                {status === '반려' && rejectReason && (
                    <div className={styles.rejectReasonBox}>
                        <span className={styles.rejectReasonTitle}>반려 사유</span>
                        <p className={styles.rejectReasonText}>{rejectReason}</p>
                    </div>
                )}
            </div>
        </Card>
    )
}

export default ExpenseInfoCard
