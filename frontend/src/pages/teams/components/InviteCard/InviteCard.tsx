import styles from './invitecard.module.css';
import { Card } from '@/shared/components/card/Card';
import { Badge } from '@/shared/components/badge/Badge';
import Button from '@/shared/components/button/Button';

interface Invitation {
    id: number;
    name: string;
    inviter: string;
}

interface InviteCardProps {
    invitation: Invitation;
}

const InviteCard = ({ invitation }: InviteCardProps) => {
    const { name, inviter} = invitation;
    
    return (
        <Card className={styles.invitationCard} noPadding={true}>
            <div className={styles.cardContainer}>
                <div>
                    <p className={styles.name}>{name}</p>
                    <p className={styles.subTitle}>
                        <span className={styles.inviter}>{inviter}</span>
                        님이 초대했어요
                    </p>
                </div>
                
                <div className={styles.btnSection}>
                    {/* 초대 삭제 api 연결 */}
                    <Button
                        className={styles.rejectBtn}
                        text='거절' 
                        style='secondary' 
                    />
                    {/* 초대 수락 api 연결 */}
                    <Button 
                        className={styles.acceptBtn}
                        text='수락'
                        style='tertiary'
                        href={`/teams/${invitation.id}/dashboard`}
                    />
                </div>
            </div>
        </Card>
    )
}

export default InviteCard