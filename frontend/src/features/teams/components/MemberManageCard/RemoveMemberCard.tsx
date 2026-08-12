import { SubmitEvent } from 'react';
import styles from './memberManageCard.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import useRemoveMember from '../../hooks/useRemoveMember';

interface InvitationCardProps {
    memberId: number | null;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    onSuccess?: () => void
}

const RemoveMemberCard = ({ memberId, onClick, onSuccess }: InvitationCardProps) => {

    const { isSubmitting, submitRemove } = useRemoveMember();

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        if (memberId === null) return;

        const result = await submitRemove(memberId);

        alert(result.message);

        if (result.success) {
            onSuccess?.();
        }
    }

    return (
        <Card small>
            <p className={styles.title}>멤버를 강퇴할까요?</p>
            <span className={styles.subTitle}>강퇴된 멤버는 더 이상 모임에 접근할 수 없어요</span>

            <form onSubmit={handleSubmit}>
                <div className={styles.removeBtnSection}>
                    <Button
                        className={`${styles.buttonSectionBtn} ${styles.cancelBtn}`}
                        text="취소"
                        onClick={onClick}
                        style='secondary'
                    />
                    <Button
                        className={`${styles.buttonSectionBtn} ${styles.removeBtn}`}
                        type="submit"
                        text={isSubmitting ? "추방하는 중..." : "강퇴하기"}
                        style="tertiary"
                        disabled={isSubmitting}
                    />
                </div>
            </form>
        </Card>
    )
}

export default RemoveMemberCard