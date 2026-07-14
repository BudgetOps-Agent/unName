import { SubmitEvent } from 'react';
import styles from './memberManageCard.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';

interface InvitationCardProps {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const RemoveMemberCard = ({ onClick }: InvitationCardProps) => {
    return (
        <Card style='smallCard'>
            <form>
                <p className={styles.title}>멤버를 강퇴할까요?</p>
                <span className={styles.subTitle}>강퇴된 멤버는 더 이상 모임에 접근할 수 없어요</span>

                <div className={styles.ButtonSection}>
                    <Button
                        className={`${styles.buttonSectionBtn} ${styles.cancelBtn}`}
                        text="취소"
                        onClick={onClick}
                        style='secondary'
                    />
                    <Button
                        className={`${styles.buttonSectionBtn} ${styles.removeBtn}`}
                        type="submit"
                        text="강퇴하기"
                        style="tertiary"
                    />
                </div>
            </form>
        </Card>
    )
}

export default RemoveMemberCard