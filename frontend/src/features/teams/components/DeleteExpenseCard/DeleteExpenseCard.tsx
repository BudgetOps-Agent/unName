import styles from './deleteexpensecard.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';

interface DeleteExpenseCardProps {
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}

const DeleteExpenseCard = ({ onClose, onConfirm, isSubmitting }: DeleteExpenseCardProps) => {
    return (
        <Card small>
            <p className={styles.title}>정말 삭제하시겠어요?</p>
            <span className={styles.subTitle}>삭제된 지출은 다시 되돌릴 수 없어요</span>

            <div className={styles.buttonSection}>
                <Button
                    className={`${styles.buttonSectionBtn} ${styles.cancelBtn}`}
                    text="취소"
                    onClick={onClose}
                    style="secondary"
                    disabled={isSubmitting}
                />
                <Button
                    className={`${styles.buttonSectionBtn} ${styles.deleteBtn}`}
                    text={isSubmitting ? "삭제하는 중..." : "삭제하기"}
                    style="tertiary"
                    onClick={onConfirm}
                    disabled={isSubmitting}
                />
            </div>
        </Card>
    );
};

export default DeleteExpenseCard;
