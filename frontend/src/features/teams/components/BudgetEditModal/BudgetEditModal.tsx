import { useState, ChangeEvent } from 'react';
import styles from './budgeteditmodal.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';

interface BudgetEditModalProps {
    onClose: () => void;
    onSubmit: (amount: number) => void;
}

const BudgetEditModal = ({ onClose, onSubmit }: BudgetEditModalProps) => {
    const [amount, setAmount] = useState('');

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value.replace(/[^0-9]/g, ''));
    };

    const handleSubmit = () => {
        if (!amount) return;
        onSubmit(Number(amount));
        onClose();
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
                        text="추가하기"
                        style="tertiary"
                        disabled={!amount}
                        onClick={handleSubmit}
                    />
                </div>
            </Card>
        </div>
    );
};

export default BudgetEditModal;
