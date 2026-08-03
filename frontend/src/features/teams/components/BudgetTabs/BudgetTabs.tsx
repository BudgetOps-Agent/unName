import styles from './budgettabs.module.css';

export type BudgetTabId = 'budget' | 'policy';

interface BudgetTabsProps {
    activeTab: BudgetTabId;
    onChange: (tab: BudgetTabId) => void;
}

const tabs: { id: BudgetTabId; label: string }[] = [
    { id: 'budget', label: '예산 관리' },
    { id: 'policy', label: '회칙·정책 관리' },
];

const BudgetTabs = ({ activeTab, onChange }: BudgetTabsProps) => {
    return (
        <div className={styles.tabs}>
            {tabs.map((tab) => (
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
