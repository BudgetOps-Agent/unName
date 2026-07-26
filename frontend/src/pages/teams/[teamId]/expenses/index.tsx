import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import styles from './expenses.module.css';
import Link from 'next/link';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import SearchBar from '../../components/SearchBar/SearchBar';
import ExpenseList from '../../components/ExpenseList/ExpenseList';
import { useExpenses, ExpenseCounts } from '../../hooks/useExpenses';
import ContentTitle from '@/shared/components/contentTitle/ContentTitle';

const filterBtn = [
    { id: 1, text: '전체' },
    { id: 2, text: '대기' },
    { id: 3, text: '승인' },
    { id: 4, text: '반려' },
];

const COUNT_KEY: Record<string, keyof ExpenseCounts> = {
    '전체': 'all',
    '대기': 'pending',
    '승인': 'approved',
    '반려': 'rejected',
};

const Expenses = () => {

    const router = useRouter();
    const { teamId } = router.query;
    const validTeamId = typeof teamId === 'string' ? teamId : undefined;

    const { expenses, counts, isLoading, error, refetch } = useExpenses(validTeamId);

    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [currentFilter, setCurrentFilter] = useState<string>("전체");

    const handleFilterChange = (filterText: string) => {
        setCurrentFilter(filterText);
    };

    const filteredExpenses = useMemo(() => {
        return expenses.filter((expense) => {
            const matchesFilter =
                currentFilter === '전체' ? true
                : currentFilter === '대기' ? (expense.status === 'SUBMITTED' || expense.status === 'ESCALATED')
                : currentFilter === '승인' ? expense.status === 'APPROVED'
                : currentFilter === '반려' ? expense.status === 'REJECTED'
                : true;

            const lowercaseKeyword = searchKeyword.toLowerCase();
            const matchesSearch =
                expense.title.toLowerCase().includes(lowercaseKeyword) ||
                expense.requesterName.toLowerCase().includes(lowercaseKeyword);

            return matchesFilter && matchesSearch;
        })
    }, [expenses, searchKeyword, currentFilter]);

    return (
        <>
            <ContentTitle title="지출 내역" subTitle={`총 ${counts.all}건이에요`} href={`/teams/${validTeamId}/expenses/new`} btnText="지출 요청" />

            {error ? (
                <Card className={styles.errorCard}>
                    <div className={styles.errorContainer}>
                        <p className={styles.errorTextTitle}>⚠️ 지출 내역을 불러오지 못했습니다</p>
                        <p className={styles.errorTextSub}>{error}</p>
                        <Button className={styles.errorBtn} text="다시 시도" onClick={() => refetch()} style="tertiary" />
                    </div>
                </Card>
            ) : (
                <>
                    <SearchBar value={searchKeyword} onChange={setSearchKeyword} />

                    <div className={styles.filterSection}>
                        {filterBtn.map((item) => {
                            const isActive = currentFilter === item.text;

                            return (
                                <div key={item.id}>
                                    <button
                                        className={`${styles.filterBtn} ${isActive ? styles.active : ""}`}
                                        onClick={() => handleFilterChange(item.text)}
                                    >
                                        <span className={styles.filterBtnText}>
                                            <p className={styles.btnTitle}>{item.text}</p>
                                            <p className={styles.btnCount}>
                                                {counts[COUNT_KEY[item.text]]}
                                            </p>
                                        </span>
                                    </button>
                                </div>
                            )
                        })}
                    </div>

                    {isLoading ? (
                        <p className={styles.empty}>불러오는 중이에요...</p>
                    ) : filteredExpenses.length === 0 ? (
                        <p className={styles.empty}>표시할 지출 내역이 없어요.</p>
                    ) : (
                        <ExpenseList expenses={filteredExpenses} />
                    )}
                </>
            )}
        </>
    )
}

export default Expenses
