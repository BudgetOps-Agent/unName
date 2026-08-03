import { useState } from 'react';
import ContentTitle from '@/shared/components/contentTitle/ContentTitle';
import { Card } from '@/shared/components/card/Card';
import BudgetTabs, { BudgetTabId } from '@/features/teams/components/BudgetTabs/BudgetTabs';
import BudgetManagementCard from '@/features/teams/components/BudgetManagementCard/BudgetManagementCard';
import PolicyManageCard from '@/features/teams/components/PolicyManageCard/PolicyManageCard';
import BudgetEditModal from '@/features/teams/components/BudgetEditModal/BudgetEditModal';

const usedBudget = 0;

const Budget = () => {
    const [activeTab, setActiveTab] = useState<BudgetTabId>('budget');
    const [totalBudget, setTotalBudget] = useState(3424);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleBudgetAdd = (amount: number) => {
        setTotalBudget((prev) => prev + amount);
    };

    return (
        <>
            <ContentTitle title="예산 관리" subTitle="예산과 회칙·정책을 관리해요" onClick={() => setIsEditModalOpen(true)} btnText="예산 수정" />

            {isEditModalOpen && (
                <BudgetEditModal onClose={() => setIsEditModalOpen(false)} onSubmit={handleBudgetAdd} />
            )}

            <Card noPadding={true}>
                <BudgetTabs activeTab={activeTab} onChange={setActiveTab} />

                {activeTab === 'budget' && (
                    <BudgetManagementCard totalBudget={totalBudget} usedBudget={usedBudget} />
                )}

                {activeTab === 'policy' && (
                    <PolicyManageCard />
                )}
            </Card>
        </>
    )
}

export default Budget;