import { ReportExpense } from '@/types/report';
import styles from './expensedetailtable.module.css';
import { Card } from '@/shared/components/card/Card';

interface ExpenseDetailTableProps {
    expenses: ReportExpense[];
    isLoading: boolean;
    isError: boolean;
}

const ExpenseDetailTable = ({ expenses, isLoading, isError }: ExpenseDetailTableProps) => {
  console.log({
    isLoading,
    isError,
    length: expenses.length,
  });
    const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

    return (
        <Card className={styles.tableContainer} noPadding={true}>
            <div className={styles.tableTitle}>
                <p className={styles.title}>지출 명세</p>
            </div>
            
            <table className={styles.reportTable}>
                <thead className={styles.tableHeader}>
                    <tr>
                        <th>항목</th>
                        <th>카테고리</th>
                        <th>요청자</th>
                        <th>날짜</th>
                        <th>금액</th>
                    </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className={styles.tableItems}>
                          <td><div className={styles.skeleton} /></td>
                          <td><div className={styles.skeleton} /></td>
                          <td><div className={styles.skeleton} /></td>
                          <td><div className={styles.skeleton} /></td>
                          <td><div className={styles.skeleton} /></td>
                        </tr>
                      ))}
                    </>
                  ) : isError ? (
                    <tr>
                      <td colSpan={5} className={styles.noData}>
                        데이터를 불러오지 못했어요.
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.noData}>
                        등록된 지출이 없어요!
                      </td>
                    </tr>
                  ) : (
                    <>
                      {expenses.map((expense) => (
                        <tr key={expense.id} className={styles.tableItems}>
                          <td className={styles.item}>{expense.title}</td>
                          <td className={styles.category}>{expense.category}</td>
                          <td className={styles.requester}>{expense.requesterName}</td>
                          <td className={styles.date}>{expense.date}</td>
                          <td className={styles.amount}>{expense.amount.toLocaleString()}원</td>
                        </tr>
                      ))}

                      <tr className={styles.totalRow}>
                        <td colSpan={4}>합계</td>
                        <td>{totalAmount.toLocaleString()}원</td>
                      </tr>
                    </>
                  )}
                </tbody>
            </table>
        </Card>
    );
};

export default ExpenseDetailTable