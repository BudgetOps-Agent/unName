import { useState, SubmitEvent } from 'react';
import styles from './memberManageCard.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import { Member } from '@/types/member';
import useTransferAdmin from '../../hooks/useTransferAdmin';

interface MandateRoleCardProps {
    teamId: string | undefined;
    members: Member[];
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onSuccess?: () => void;
}

const ROLE_LABEL: Record<Member['role'], string> = {
    ADMIN: '관리자',
    ACCOUNTANT: '총무',
    MEMBER: '멤버',
}

const MandateRoleCard = ({ teamId, members, onClick, onSuccess }: MandateRoleCardProps) => {

    const [mandateMemberId, setMandateMemberId] = useState<number | null>(null);
    const { isSubmitting, submitTransfer } = useTransferAdmin(teamId);

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        if (mandateMemberId === null) {
            alert("위임할 멤버를 선택해 주세요.");
            return;
        }

        const result = await submitTransfer(mandateMemberId);

        alert(result.message);

        if (result.success) {
            onSuccess?.();
        }
    }

    return (
        <Card small>
            <p className={styles.title}>관리자 권한 위임</p>
            <span className={styles.subTitle}>관리자 권한을 다른 멤버에게 넘겨요. 이후 본인은 일반 멤버가 돼요.</span>

            <form onSubmit={handleSubmit}>
                <div className={`${styles.roleSection} ${styles.mandateRoleBtnContainer}`}>
                    {members.map((member) => (
                        <Button
                            key={member.id}
                            className={`${styles.mandateRoleBtn} ${mandateMemberId === member.id ? styles.active : ''}`}
                            text={<span><p className={styles.name}>{member.name}</p> <p className={styles.role}>{ROLE_LABEL[member.role]}</p></span>}
                            onClick={() => setMandateMemberId(member.id)}
                            style='secondary'
                        />
                    ))}
                </div>

                <div className={styles.ButtonSection}>
                    <Button
                        className={`${styles.buttonSectionBtn} ${styles.cancelBtn}`}
                        text="취소"
                        onClick={onClick}
                        style='secondary'
                    />
                    <Button
                        className={`${styles.buttonSectionBtn} ${styles.mandateBtn}`}
                        type="submit"
                        text={isSubmitting ? "위임하는 중..." : "위임하기"}
                        style="tertiary"
                        disabled={isSubmitting}
                    />
                </div>
            </form>
        </Card>
    )
}

export default MandateRoleCard