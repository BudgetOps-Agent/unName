import styles from './budgetmanagementcard.module.css';
import ProgressBar from '@/shared/components/progressbar/ProgressBar';
import AIBudgetRecommendCard from '@/features/teams/components/AIBudgetRecommendCard/AIBudgetRecommendCard';

interface BudgetManagementCardProps {
    totalBudget: number;
    usedBudget: number;
}

const BudgetManagementCard = ({ totalBudget, usedBudget }: BudgetManagementCardProps) => {
    const remainingBudget = totalBudget - usedBudget;
    const usagePercentage = totalBudget > 0 ? Math.round((usedBudget / totalBudget) * 100) : 0;

    return (
        <div className={styles.content}>
            <div className={styles.header}>
                <span className={styles.label}>전체 예산</span>
                <span className={styles.usageLabel}>{`${usagePercentage}% 사용됨`}</span>
            </div>

            <p className={styles.totalAmount}>{`${totalBudget.toLocaleString()}원`}</p>

            <ProgressBar total={totalBudget} used={usedBudget} />

            <div className={styles.statsRow}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>사용됨</span>
                    <p className={`${styles.statValue} ${styles.used}`}>{`${usedBudget.toLocaleString()}원`}</p>
                </div>

                <div className={styles.statItem}>
                    <span className={styles.statLabel}>잔여</span>
                    <p className={`${styles.statValue} ${styles.remaining}`}>{`${remainingBudget.toLocaleString()}원`}</p>
                </div>
            </div>

            <AIBudgetRecommendCard />
        </div>
    );
};

export default BudgetManagementCard;
