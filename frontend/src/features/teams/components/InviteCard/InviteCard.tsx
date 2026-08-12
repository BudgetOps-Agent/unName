import styles from './invitecard.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';
import Skeleton from '@/shared/components/skeleton/Skeleton';

interface Invitation {
    id: number;
    teamName: string;
    invitedAt: string;
    inviterName: string;
}

interface InviteCardProps {
    invitation?: Invitation;   
    isLoading?: boolean;       
    isPending?: boolean;  
    errorMsg?: string | null | undefined;
    onAccept?: () => void;
    onReject?: () => void;
}

const InviteCard = ({ invitation, isLoading = false, isPending = false, errorMsg, onAccept, onReject }: InviteCardProps) => {

    if (isLoading || !invitation) {
        return(
            <Card className={styles.invitationCard} noPadding={true}>
                <div className={styles.cardContainer}>
                    <div>
                        <Skeleton width={120} height={16} delay={0} />
                        <Skeleton width={70} height={12} delay={0.1} />
                    </div>

                    <div className={styles.btnSection}>
                        <Skeleton height={8} radius={999} delay={0.4} />
                    </div>
                </div>
            </Card>
        )
    }

    const { teamName, inviterName } = invitation;

    return (
        <Card className={styles.invitationCard} noPadding={true}>
            <div className={styles.cardContainer}>
                <div>
                    <p className={styles.name}>{teamName}</p>
                    <p className={styles.subTitle}>
                        <span className={styles.inviter}>{inviterName}</span>
                        님이 초대했어요
                    </p>
                    {errorMsg && <p className={styles.cardError}>{errorMsg}</p>}
                </div>
                
                <div className={styles.btnSection}>
                    <Button
                        className={styles.rejectBtn}
                        text='거절' 
                        style='secondary' 
                        onClick={onReject}
                        disabled={isPending}
                    />
                    <Button 
                        className={styles.acceptBtn}
                        text='수락'
                        style='tertiary'
                        onClick={onAccept}
                        disabled={isPending}
                    />
                </div>
            </div>
        </Card>
    )
}

export default InviteCard