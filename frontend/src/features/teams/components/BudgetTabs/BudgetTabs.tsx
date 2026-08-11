import styles from './budgettabs.module.css';

export type BudgetTabId = 'budget' | 'policy';

interface BudgetTabsProps {
    activeTab: BudgetTabId;
    onChange: (tab: BudgetTabId) => void;
    // 회칙·정책 관리는 관리자만 (백엔드도 API-029/031을 ADMIN으로 제한)
    canManagePolicy: boolean;
}

const tabs: { id: BudgetTabId; label: string; adminOnly?: boolean }[] = [
    { id: 'budget', label: '예산 관리' },
    { id: 'policy', label: '회칙·정책 관리', adminOnly: true },
];

const BudgetTabs = ({ activeTab, onChange, canManagePolicy }: BudgetTabsProps) => {
    const visibleTabs = canManagePolicy ? tabs : tabs.filter((tab) => !tab.adminOnly);

    return (
        <div className={styles.tabs}>
            {visibleTabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                    onClick={() => onChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default BudgetTabs;
