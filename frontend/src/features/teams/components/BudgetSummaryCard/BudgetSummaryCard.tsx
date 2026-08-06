import { Card } from "@/shared/components/card/Card";
import Button from "@/shared/components/button/Button";
import ProgressBar from "@/shared/components/progressbar/ProgressBar";
import { Dashboard } from "@/features/teams/hooks/useDashboard";
import styles from "./BudgetSummaryCard.module.css";

interface BudgetSummaryCardProps {
    dashboard: Dashboard | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

const BudgetSummaryCard = ({ dashboard, isLoading, error, refetch }: BudgetSummaryCardProps) => {
    return (
        <Card title="이번 달 예산" headerRight={dashboard ? `총 ${dashboard.totalBudget.toLocaleString()}원` : undefined}>
            {isLoading ? (
                <p>불러오는 중이에요...</p>
            ) : error ? (
                <div className={styles.budgetError}>
                    <p>{error}</p>
                    <Button text="다시 시도" onClick={() => refetch()} style="tertiary" />
                </div>
            ) : dashboard && (
                <>
                    <div>
                        <div className={styles.progressContent}>
                            <p>{`${dashboard.usedBudget.toLocaleString()}원`}</p>
                            <span>사용됨</span>
                        </div>
                        <div className={styles.progressBar}>
                            <ProgressBar total={dashboard.totalBudget} used={dashboard.usedBudget} />
                        </div>
                    </div>

                    <div className={styles.budgetStatusSection}>
                        <div className={`${styles.budgetStatus} ${styles.usedBudget}`}>
                            <span>사용됨</span>
                            <p>{`${dashboard.usedBudget.toLocaleString()}원`}</p>
                        </div>

                        <div className={`${styles.budgetStatus} ${styles.pendingBudget}`}>
                            <span>대기 중</span>
                            <p>{`${dashboard.pendingAmount.toLocaleString()}원`}</p>
                        </div>

                        <div className={`${styles.budgetStatus} ${styles.remainBudget}`}>
                            <span>남은 예산</span>
                            <p>{`${dashboard.remainingBudget.toLocaleString()}원`}</p>
                        </div>
                    </div>
                </>
            )}
        </Card>
    );
};

export default BudgetSummaryCard;
