import { useState } from 'react';
import styles from './memberManageCard.module.css';
import { Card } from '@/shared/components/card/Card';
import { Badge } from '@/shared/components/badge/Badge';
import Button from '@/shared/components/button/Button';

interface ChangeRoleCardProps {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ChangeRoleCard = ({ onClick }: ChangeRoleCardProps) => {

    const [changeRole, setChangeRole] = useState('');

    return (
        <Card style='smallCard'>
            <form>
                <p className={styles.title}>권한 변경</p>
                <span className={styles.subTitle}>변경할 역할을 선택해 주세요</span>

                <div className={styles.roleSection}>
                    <span className={styles.roleTitle}>역할</span>

                    <div className={styles.changeRoleBtnContainer}>
                        <Button 
                            className={`${styles.changeRoleBtn} ${changeRole === '총무' ? styles.active : ''}`}
                            text='총무 — 지출 승인·예산 관리'
                            iconLeft={<Badge className={styles.roleBadge} text='총무' style='purple' />}
                            onClick={() => setChangeRole('총무')}
                            style='secondary'
                        />
                        <Button 
                            className={`${styles.changeRoleBtn} ${changeRole === '멤버' ? styles.active : ''}`}
                            text='멤버 — 지출 요청만 가능'
                            iconLeft={<Badge className={styles.roleBadge} text='멤버' style='gray' />}
                            onClick={() => setChangeRole('멤버')}
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
                        className={`${styles.buttonSectionBtn} ${styles.changeBtn}`}
                        type="submit"
                        text="변경하기"
                        style="tertiary"
                    />
                </div>
            </form>
        </Card>
    )
}

export default ChangeRoleCard