import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './budget.module.css';
import ContentTitle from '@/shared/components/contentTitle/ContentTitle';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import BudgetTabs, { BudgetTabId } from '@/features/teams/components/BudgetTabs/BudgetTabs';
import BudgetManagementCard from '@/features/teams/components/BudgetManagementCard/BudgetManagementCard';
import PolicyManageCard from '@/features/teams/components/PolicyManageCard/PolicyManageCard';
import BudgetEditModal from '@/features/teams/components/BudgetEditModal/BudgetEditModal';
import useBudget from '@/features/teams/hooks/useBudget';
import useRoleGuard from '@/features/teams/hooks/useRoleGuard';

const Budget = () => {
    const router = useRouter();
    const { teamId } = router.query;
    const validTeamId = typeof teamId === 'string' ? teamId : undefined;

    const { budget, isLoading, error, refetch } = useBudget(validTeamId);
    const { isChecking: isRoleChecking, isAllowed } = useRoleGuard(validTeamId, ['ADMIN', 'ACCOUNTANT']);

    const [activeTab, setActiveTab] = useState<BudgetTabId>('budget');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (isRoleChecking || !isAllowed) {
        return <p className={styles.placeholder}>불러오는 중이에요...</p>;
    }

    return (
        <>
            <ContentTitle title="모임 관리" subTitle="예산과 회칙·정책을 관리해요" onClick={() => setIsEditModalOpen(true)} btnText="예산 추가" />

            {isEditModalOpen && (
                <BudgetEditModal
                    teamId={validTeamId}
                    currentTotalBudget={budget?.totalBudget ?? 0}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={refetch}
                />
            )}

            <Card noPadding={true}>
                <BudgetTabs activeTab={activeTab} onChange={setActiveTab} />

                {activeTab === 'budget' && (
                    error ? (
                        <div className={styles.errorContainer}>
                            <p className={styles.errorTextTitle}>⚠️ 예산 정보를 불러오지 못했습니다</p>
                            <p className={styles.errorTextSub}>{error}</p>
                            <Button className={styles.errorBtn} text="다시 시도" onClick={() => refetch()} style="tertiary" />
                        </div>
                    ) : isLoading || !budget ? (
                        <p className={styles.placeholder}>불러오는 중이에요...</p>
                    ) : (
                        <BudgetManagementCard
                            teamId={validTeamId}
                            totalBudget={budget.totalBudget}
                            usedBudget={budget.usedBudget}
                            remainingBudget={budget.remainingBudget}
                            usagePercentage={budget.usagePercentage}
                        />
                    )
                )}

                {activeTab === 'policy' && (
                    <PolicyManageCard teamId={validTeamId} />
                )}
            </Card>
        </>
    )
}

export default Budget;