import { useState } from 'react';
import ContentTitle from '@/shared/components/contentTitle/ContentTitle';
import { Card } from '@/shared/components/card/Card';
import BudgetTabs, { BudgetTabId } from '@/features/teams/components/BudgetTabs/BudgetTabs';
import BudgetManagementCard from '@/features/teams/components/BudgetManagementCard/BudgetManagementCard';
import PolicyManageCard from '@/features/teams/components/PolicyManageCard/PolicyManageCard';

const totalBudget = 3424;
const usedBudget = 0;

const Budget = () => {
    const [activeTab, setActiveTab] = useState<BudgetTabId>('budget');

    return (
        <>
            <ContentTitle title="예산 관리" subTitle="예산과 회칙·정책을 관리해요" onClick={()=>console.log('버튼 클릭')} btnText="예산 수정" />

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