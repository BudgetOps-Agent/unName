import { ReportExpense } from '@/types/report';
import styles from './expensedetailtable.module.css';
import { Card } from '@/shared/components/card/Card';
import Skeleton from '@/shared/components/skeleton/Skeleton';
import { CATEGORY_LABEL } from '@/features/teams/constants/category';

interface ExpenseDetailTableProps {
    expenses: ReportExpense[];
    isLoading: boolean;
    isError: boolean;
    // 합계 행이 주석 처리돼 있어 지금은 쓰지 않음. 행을 되살릴 때 사용
    totalAmount?: number;
}

const formatDate = (isoString: string) => {
    if (!isoString) return "";
    return isoString.slice(0, 10);
}

const ExpenseDetailTable = ({ expenses, isLoading, isError }: ExpenseDetailTableProps) => {

    return (
        <Card className={styles.tableContainer} noPadding={true}>
            <div className={styles.tableTitle}>
                <p className={styles.title}>지출 명세</p>
            </div>
            
            <div className={styles.table}>
                <table className={styles.reportTable}>
                    <thead className={styles.tableHeader}>
                        <tr>
                            <th>항목</th>
                            <th>카테고리</th>
                            <th>요청자</th>
                            <th>처리자</th>
                            <th>날짜</th>
                            <th>금액</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading ? (
                            <>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index} className={styles.tableItems}>
                                        <td><Skeleton width={120} height={16} delay={0} /></td>
                                        <td><Skeleton width={70} height={12} delay={0.3} /></td>
                                        <td><Skeleton width={70} height={12} delay={0.5} /></td>
                                        <td><Skeleton width={70} height={12} delay={0.6} /></td>
                                        <td><Skeleton width={70} height={12} delay={0.7} /></td>
                                        <td><Skeleton width={70} height={12} delay={1.0} /></td>
                                    </tr>
                                ))}
                            </>
                        ) : isError ? (
                            <tr>
                                <td colSpan={6} className={styles.noData}>
                                    데이터를 불러오지 못했어요.
                                </td>
                            </tr>
                        ) : expenses.length === 0 ? (
                            <tr>
                                <td colSpan={6} className={styles.noData}>
                                    아직 승인된 지출이 없어요
                                </td>
                            </tr>
                        ) : (
                            <>
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className={styles.tableItems}>
                                        <td className={styles.item}>{expense.title}</td>
                                        <td className={styles.category}>
                                            {expense.category ? (CATEGORY_LABEL[expense.category] ?? expense.category) : '-'}
                                        </td>
                                        <td className={styles.requester}>{expense.requesterName}</td>
                                        <td className={styles.processor}>{expense.processorName ?? '-'}</td>
                                        <td className={styles.date}>{formatDate(expense.date)}</td>
                                        <td className={styles.amount}>{expense.amount.toLocaleString()}원</td>
                                    </tr>
                                ))}

                                {/* <tr className={styles.totalRow}>
                        <td colSpan={4}>합계</td>
                        <td>{totalAmount.toLocaleString()}원</td>
                      </tr> */}
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default ExpenseDetailTable