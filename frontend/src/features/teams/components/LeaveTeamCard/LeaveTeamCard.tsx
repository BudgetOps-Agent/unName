import styles from './leaveteamcard.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';

// delete는 관리자 혼자 남아 나갈 대상이 없을 때 — 모임 자체를 지운다
type LeaveTeamMode = 'leave' | 'delete';

interface LeaveTeamCardProps {
    mode?: LeaveTeamMode;
    teamName?: string;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}

const LeaveTeamCard = ({ mode = 'leave', teamName, onClose, onConfirm, isSubmitting }: LeaveTeamCardProps) => {
    const isDelete = mode === 'delete';

    const title = isDelete
        ? (teamName ? `'${teamName}'을(를) 삭제할까요?` : '모임을 삭제할까요?')
        : (teamName ? `'${teamName}'에서 나갈까요?` : '모임에서 나갈까요?');

    const description = isDelete
        ? '지출·회칙·예산까지 모두 지워지고 되돌릴 수 없어요'
        : '나가면 이 모임의 지출과 정산 내역을 볼 수 없어요';

    const confirmText = isDelete
        ? (isSubmitting ? '삭제하는 중...' : '삭제하기')
        : (isSubmitting ? '나가는 중...' : '나가기');

    return (
        <Card small>
            <p className={styles.title}>{title}</p>
            <span className={styles.subTitle}>{description}</span>

            <div className={styles.buttonSection}>
                <Button
                    className={`${styles.buttonSectionBtn} ${styles.cancelBtn}`}
                    text="취소"
                    onClick={onClose}
                    style="secondary"
                    disabled={isSubmitting}
                />
                <Button
                    className={`${styles.buttonSectionBtn} ${styles.leaveBtn}`}
                    text={confirmText}
                    style="tertiary"
                    onClick={onConfirm}
                    disabled={isSubmitting}
                />
            </div>
        </Card>
    );
};

export default LeaveTeamCard;