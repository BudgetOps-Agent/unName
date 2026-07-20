import styles from './groupcard.module.css';
import Link from 'next/link';
import { Card } from '@/shared/components/card/Card';
import { Badge } from '@/shared/components/badge/Badge';
import ProgressBar from '@/shared/components/progressbar/ProgressBar';

interface Group {
    id: number;
    name: string;
    member: number;
    role: string;
    budget: number;
    usedBudget: number;
}

interface GroupCardProps {
    group: Group;
}

const GroupCard = ({ group }: GroupCardProps) => {
    const { id, name, member, role, budget, usedBudget } = group;
    
    const budgetUsageRate = budget > 0
        ? Math.round((usedBudget / budget) * 100)
        : 0;

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
                        <p style={{ color: '#191F28', fontWeight: 'bold' }}>{budgetUsageRate}%</p>
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