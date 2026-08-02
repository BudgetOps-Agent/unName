import Link from 'next/link';
import Image from 'next/image';
import styles from './pendingapprovalcard.module.css';
import { Card } from '@/shared/components/card/Card';
import { Badge } from '@/shared/components/badge/Badge';

type PendingStatus = 'SUBMITTED' | 'ESCALATED';

interface PendingExpense {
    id: number;
    title: string;
    amount: number;
    status: string;
    date: string;
    requesterName?: string;
}

interface PendingApprovalCardProps {
    teamId: string | undefined;
    pendingCount: number;
    recentExpenses: PendingExpense[];
    isLoading?: boolean;
}

const STATUS_LABEL: Record<PendingStatus, string> = {
    SUBMITTED: '대기',
    ESCALATED: '⚠ 에스컬',
};

const formatDate = (isoString: string) => {
    if (!isoString) return '';
    return isoString.slice(0, 10);
};

const PendingApprovalCard = ({ teamId, pendingCount, recentExpenses, isLoading = false }: PendingApprovalCardProps) => {
    return (
        <Card noPadding={true}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <p className={styles.cardTitle}>승인이 필요해요</p>
                    <span className={styles.count}>{pendingCount}</span>
                </div>
                <Link href={`/teams/${teamId}/expenses`} className={styles.link}>전체보기</Link>
            </div>

            {!isLoading && recentExpenses.length === 0 ? (
                <p className={styles.empty}>승인 대기 중인 지출이 없어요</p>
            ) : (
                <div className={styles.itemList}>
                    {recentExpenses.map((request) => (
                        <Link
                            key={request.id}
                            href={`/teams/${teamId}/expenses/${request.id}`}
                            className={styles.item}
                        >
                            <span className={styles.itemIcon}>
                                <Image src="/sidebar/expenses-active.svg" alt="" width={18} height={18} />
                            </span>

                            <div className={styles.itemContent}>
                                <div className={styles.itemTitle}>
                                    <p className={styles.title}>{request.title}</p>
                                    <Badge text={STATUS_LABEL.SUBMITTED} style="yellow" />
                                    {request.status === 'ESCALATED' && (
                                        <Badge text={STATUS_LABEL.ESCALATED} style="orange" size="sm" />
                                    )}
                                </div>

                                <div className={styles.itemDetail}>
                                    {request.requesterName
                                        ? `${request.requesterName} · ${formatDate(request.date)}`
                                        : formatDate(request.date)}
                                </div>
                            </div>

                            <p className={styles.amount}>{`${request.amount.toLocaleString()}원`}</p>
                        </Link>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default PendingApprovalCard;
