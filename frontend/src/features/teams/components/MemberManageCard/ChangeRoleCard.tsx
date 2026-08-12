import { useState, SubmitEvent } from 'react';
import styles from './memberManageCard.module.css';
import { Card } from '@/shared/components/card/Card';
import { Badge } from '@/shared/components/badge/Badge';
import Button from '@/shared/components/button/Button';
import useChangeRole from '../../hooks/useChangeRole';

type ChangeableRole = 'ACCOUNTANT' | 'MEMBER';

interface ChangeRoleCardProps {
    memberId: number | null;
    currentRole: ChangeableRole;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onSuccess?: () => void;
}

const ChangeRoleCard = ({ memberId, currentRole, onClick, onSuccess }: ChangeRoleCardProps) => {

    const [changeRole, setChangeRole] = useState<ChangeableRole | ''>('');
    const { isSubmitting, submitChangeRole } = useChangeRole();

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        if (memberId === null || changeRole === '') {
            alert("변경할 역할을 선택해 주세요.");
            return;
        }

        const result = await submitChangeRole(memberId, changeRole);

        if (result.success) {
            alert("권한이 변경되었습니다.");
            onSuccess?.();
        } else {
            alert(result.message);
        }
    }

    return (
        <Card small>
            <p className={styles.title}>권한 변경</p>
            <span className={styles.subTitle}>변경할 역할을 선택해 주세요</span>

            <form onSubmit={handleSubmit}>
                <div className={styles.roleSection}>
                    <span className={styles.roleTitle}>역할</span>

                    {/* 현재 역할이 아닌 쪽만 노출 (총무 → 멤버, 멤버 → 총무) */}
                    <div className={styles.changeRoleBtnContainer}>
                        {currentRole === 'MEMBER' && (
                            <Button
                                className={`${styles.changeRoleBtn} ${changeRole === 'ACCOUNTANT' ? styles.active : ''}`}
                                text='총무 — 지출 승인·예산 관리'
                                iconLeft={<Badge className={styles.roleBadge} text='총무' style='purple' />}
                                onClick={() => setChangeRole('ACCOUNTANT')}
                                style='secondary'
                            />
                        )}
                        {currentRole === 'ACCOUNTANT' && (
                            <Button
                                className={`${styles.changeRoleBtn} ${changeRole === 'MEMBER' ? styles.active : ''}`}
                                text='멤버 — 지출 요청만 가능'
                                iconLeft={<Badge className={styles.roleBadge} text='멤버' style='gray' />}
                                onClick={() => setChangeRole('MEMBER')}
                                style='secondary'
                            />
                        )}
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
                        className={`${styles.buttonSectionBtn} ${styles.changeBtn}`}
                        type="submit"
                        text={isSubmitting ? "변경하는 중..." : "변경하기"}
                        style="tertiary"
                        disabled={isSubmitting}
                    />
                </div>
            </form>
        </Card>
    )
}

export default ChangeRoleCard