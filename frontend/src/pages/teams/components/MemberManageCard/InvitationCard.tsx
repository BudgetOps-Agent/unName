import { useState, SubmitEvent } from 'react';
import styles from './memberManageCard.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import Input from '@/shared/components/input/Input';
import { Badge } from '@/shared/components/badge/Badge';
import { validateEmailFormat } from '@/pages/auth/utils/signupValidator';
import useInviteMember from '../../hooks/useInviteMember';

interface InvitationCardProps {
    teamId: string | undefined;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    onSuccess?: () => void
}

const InvitationCard = ({ teamId, onClick, onSuccess }: InvitationCardProps) => {

    const [email, setEmail] = useState<string>('');
    const [role, setRole] = useState<string>('');
    const { isSubmitting, submitInvite } = useInviteMember(teamId);

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        if (!validateEmailFormat(email)) {
            alert("올바른 이메일 형식이 아닙니다.");
            return;
        }

        const result = await submitInvite(email);

        alert(result.message);

        if (result.success) {
            onSuccess?.();
        }
    }

    return (
        <Card small>
            <p className={styles.title}>멤버 초대</p>
            <span className={styles.subTitle}>이메일로 초대 링크를 보내드려요</span>
            
            <form onSubmit={handleSubmit}>
                <div className={styles.emailSection}>
                    <Input
                        id="email"
                        label="이메일"
                        type="email"
                        value={email}
                        placeholder='이메일을 입력해 주세요'
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className={styles.roleSection}>
                    <span className={styles.roleTitle}>역할</span>

                    <div className={styles.roleBtnContainer}>
                        <Button 
                            className={`${styles.roleBtn} ${role === '총무' ? styles.active : ''}`}
                            iconOnly={true}
                            iconLeft={<Badge className={styles.roleBadge} text='총무' style='purple' />}
                            onClick={() => setRole('총무')}
                            style='secondary'
                        />
                        <Button 
                            className={`${styles.roleBtn} ${role === '멤버' ? styles.active : ''}`}
                            iconOnly={true}
                            iconLeft={<Badge className={styles.roleBadge} text='멤버' style='gray' />}
                            onClick={() => setRole('멤버')}
                            style='secondary' 
                        />
                    </div>
                </div>

                <div className={styles.ButtonSection}>
                    <Button
                        className={`${styles.buttonSectionBtn} ${styles.cancelBtn}`}
                        text="취소"
                        onClick={onClick}
                        style='secondary'
                    />
                    <Button
                        className={`${styles.buttonSectionBtn} ${styles.inviteBtn}`}
                        type="submit"
                        text={isSubmitting ? "보내는 중..." : "초대 보내기"}
                        style="tertiary"
                        disabled={isSubmitting}
                    />
                </div>
            </form>
        </Card>
    )
}

export default InvitationCard