import styles from './groupcard.module.css';
import Link from 'next/link';
import { Card } from '@/shared/components/card/Card';
import { Badge } from '@/shared/components/badge/Badge';
import ProgressBar from '@/shared/components/progressbar/ProgressBar';
import Skeleton from '@/shared/components/skeleton/Skeleton';

interface Group {
    id: number;
    name: string;
    member: number;
    role: string;
    budget: number;
    usedBudget: number;
    percentage: number;
}

interface GroupCardProps {
    group?: Group;
    isLoading?: boolean;
}

const GroupCard = ({ group, isLoading = false }: GroupCardProps) => {

    if (isLoading || !group) {
        return (
            <Card className={styles.groupCard}>
                <div className={styles.cardContainer}>
                    <div className={styles.cardHeader}>
                        <div className={styles.headerLeft}>
                            <Skeleton width={120} height={16} delay={0} />
                            <Skeleton width={70} height={12} delay={0.1} />
                        </div>
                        <Skeleton width={48} height={20} radius={999} delay={0.2} />
                    </div>

                    <div className={styles.progressSection}>
                        <div className={styles.progressHeader}>
                            <Skeleton width={60} height={12} delay={0.3} />
                            <Skeleton width={32} height={12} delay={0.35} />
                        </div>

                        <Skeleton height={8} radius={999} delay={0.4} />

                        <div className={styles.progressFooter}>
                            <Skeleton width={80} height={12} delay={0.5} />
                            <Skeleton width={80} height={12} delay={0.55} />
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    const { id, name, member, role, budget, usedBudget, percentage } = group;

    return (
        <Card className={styles.groupCard}>
            <Link className={styles.cardContainer} href={`/teams/${id}/dashboard`}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerLeft}>
                        <p className={styles.title}>{name}</p>
                        <p className={styles.subTitle}>{`멤버 ${member}명`}</p>
                    </div>

                    <Badge 
                        text={role}
                        style={
                            role === '관리자' ? 'blue'
                            : role === '총무' ? 'purple'
                            : 'gray'
                        }
                    />
                </div>

                <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                        <p>예산 사용률</p>
                        <p style={{ color: '#191F28', fontWeight: 'bold' }}>{percentage}%</p>
                    </div>

                    <ProgressBar total={budget} used={usedBudget} />
                    
                    <div className={styles.progressFooter}>
                        <p>{usedBudget.toLocaleString()}원 사용</p>
                        <p>총 {budget.toLocaleString()}원</p>
                    </div>
                </div>
            </Link>
        </Card>
    )
}

export default GroupCard