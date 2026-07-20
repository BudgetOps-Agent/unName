import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import styles from './expenses.module.css';
import Link from 'next/link';
import SearchBar from '../../components/SearchBar/SearchBar';
import ExpenseList from '../../components/ExpenseList/ExpenseList';

const filterBtn = [
    { id: 1, text: '전체' },
    { id: 2, text: '대기' },
    { id: 3, text: '승인' },
    { id: 4, text: '반려' },
];

const expenses = [
    { id: 1, title: '정기 회의 다과비', status: '승인', name: '박지호', expense: 45000, escalation: false, createdAt: '2025-01-15' },
    { id: 2, title: 'AWS 서버 운영비', status: '승인', name: '김민준', expense: 180000, escalation: false, createdAt: '2025-01-18' },
    { id: 3, title: '해커톤 참가비', status: '대기', name: '이서연', expense: 300000, escalation: false, createdAt: '2025-01-22' },
    { id: 4, title: '외부 강사 강연료', status: '대기', name: '박지호', expense: 500000, escalation: true, createdAt: '2025-01-23' },
    { id: 5, title: '팀 회식비', status: '반려', name: '최수아', expense: 150000, escalation: false, createdAt: '2025-01-20' },
    { id: 6, title: '노션 팀 플랜', status: '승인', name: '김민준', expense: 48000, escalation: false, createdAt: '2025-01-10' },
    { id: 7, title: '포스터 인쇄비', status: '승인', name: '정다은', expense: 70000, escalation: false, createdAt: '2025-01-08' },
];

const Expenses = () => {

    const router = useRouter();
    const { teamId } = router.query;
    const validTeamId = typeof teamId === 'string' ? teamId : undefined;

    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [currentFilter, setCurrentFilter] = useState<string>("전체");

    const handleFilterChange = (filterText: string) => {
        setCurrentFilter(filterText);
    };

    const filteredExpenses = useMemo(() => {
        return expenses.filter((expense) => {
            const matchesFilter = currentFilter === '전체' || expense.status === currentFilter;

            const lowercaseKeyword = searchKeyword.toLowerCase();
            const matchesSearch =
                expense.title.toLowerCase().includes(lowercaseKeyword) ||
                expense.name.toLowerCase().includes(lowercaseKeyword);

            return matchesFilter && matchesSearch;
        })
    }, [searchKeyword, currentFilter]);

    return (
        <div className={styles.expensesContainer}>
            <div className={styles.expensesHeader}>
                <div className={styles.headerLeft}>
                    <p className={styles.title}>지출 내역</p>
                    <p className={styles.subTitle}>총 {expenses.length}건이에요</p>
                </div>

                <Link className={styles.requestBtn} href={`/teams/${validTeamId}/expenses/new`}>+ 지출 요청</Link>

            </div>

            <SearchBar value={searchKeyword} onChange={setSearchKeyword} />

            <div className={styles.filterSection}>
                {filterBtn.map((item) => {
                    const statusCount = item.text === '전체'
                        ? expenses.length
                        : expenses.filter(expense => expense.status === item.text).length;

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
                                        {item.text === '전체' ? expenses.length : statusCount}
                                    </p>
                                </span>
                            </button>
                            </div>
                    )
                })}
            </div>

            <ExpenseList expenses={filteredExpenses} />
        </div>
    )
}

export default Expenses