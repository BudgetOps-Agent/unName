import { useState } from 'react';
import styles from './memberManageCard.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';

interface Member {
    id: number;
    name: string;
    role: string;
    email: string;
}

interface MandateRoleCardProps {
    members: Member[];
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const MandateRoleCard = ({ members, onClick }: MandateRoleCardProps) => {

    const [mandateMember, setMandateMember] = useState('');

    return (
        <Card style='smallCard'>
            <form>
                <p className={styles.title}>관리자 권한 위임</p>
                <span className={styles.subTitle}>관리자 권한을 다른 멤버에게 넘겨요. 이후 본인은 일반 멤버가 돼요.</span>

                <div className={`${styles.roleSection} ${styles.mandateRoleBtnContainer}`}>
                    {members.map((member) => (
                        <Button 
                            className={`${styles.mandateRoleBtn} ${mandateMember === `${member.name}` ? styles.active : ''}`}
                            text={<span><p className={styles.name}>{member.name}</p> <p className={styles.role}>{member.role}</p></span>}
                            onClick={() => setMandateMember(`${member.name}`)}
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
                        text="위임하기"
                        style="tertiary"
                    />
                </div>
            </form>
        </Card>
    )
}

export default MandateRoleCard