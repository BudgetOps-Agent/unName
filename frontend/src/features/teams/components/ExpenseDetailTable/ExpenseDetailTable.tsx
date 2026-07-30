import styles from './expensedetailtable.module.css';
import { Card } from '@/shared/components/card/Card';

interface Expense {
    id: number;
    item: string;
    category: string;
    requester: string;
    date: string;
    amount: number;
}

interface ExpenseDetailTableProps {
    expenses: Expense[];
}

const ExpenseDetailTable = ({ expenses }: ExpenseDetailTableProps) => {

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
                    {expenses.map((expense) => (
                        <tr key={expense.id} className={styles.tableItems}>
                            <td className={styles.item}>{expense.item}</td>
                            <td className={styles.category}>{expense.category}</td>
                            <td className={styles.requester}>{expense.requester}</td>
                            <td className={styles.date}>{expense.date}</td>
                            <td className={styles.amount}>{expense.amount.toLocaleString()}원</td>
                        </tr>
                    ))}

                    <tr className={styles.totalRow}>
                        <td colSpan={4}>합계</td>
                        <td>{totalAmount.toLocaleString()}원</td>
                    </tr>
                </tbody>
            </table>
        </Card>
    );
};

export default ExpenseDetailTable