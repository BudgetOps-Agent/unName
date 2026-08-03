import { useState, ChangeEvent } from 'react';
import styles from './budgeteditmodal.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import useUpdateBudget from '@/features/teams/hooks/useUpdateBudget';

interface BudgetEditModalProps {
    teamId: string | undefined;
    currentTotalBudget: number;
    onClose: () => void;
    onSuccess: () => void;
}

const BudgetEditModal = ({ teamId, currentTotalBudget, onClose, onSuccess }: BudgetEditModalProps) => {
    const [amount, setAmount] = useState('');
    const { isSubmitting, submitBudgetUpdate } = useUpdateBudget(teamId);

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value.replace(/[^0-9]/g, ''));
    };

    const handleSubmit = async () => {
        if (!amount) return;

        const result = await submitBudgetUpdate(currentTotalBudget + Number(amount));

        if (result.success) {
            onSuccess();
            onClose();
        } else {
            alert(result.message);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <Card small>
                <p className={styles.title}>예산 수정</p>

                <div className={styles.formGroup}>
                    <label className={styles.label}>금액</label>
                    <div className={styles.amountInput}>
                        <input
                            placeholder="0"
                            inputMode="numeric"
                            value={amount ? Number(amount).toLocaleString() : ''}
                            onChange={handleAmountChange}
                        />
                        <span className={styles.unit}>원</span>
                    </div>
                </div>

                <div className={styles.buttonSection}>
                    <Button
                        className={styles.cancelBtn}
                        text="취소"
                        style="secondary"
                        onClick={onClose}
                    />
                    <Button
                        className={styles.submitBtn}
                        text={isSubmitting ? "추가하는 중..." : "추가하기"}
                        style="tertiary"
                        disabled={!amount || isSubmitting}
                        onClick={handleSubmit}
                    />
                </div>
            </Card>
        </div>
    );
};

export default BudgetEditModal;
