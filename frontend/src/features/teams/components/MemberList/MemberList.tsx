import { useState } from 'react';
import styles from './memberlist.module.css';
import Button from '@/shared/components/button/Button';
import { Badge } from "@/shared/components/badge/Badge";
import { Member } from '@/types/member';
import { TeamRole } from '@/types/team';
import ChangeRoleCard from '@/features/teams/components/MemberManageCard/ChangeRoleCard';
import RemoveMemberCard from '@/features/teams/components/MemberManageCard/RemoveMemberCard';
import MandateRoleCard from '@/features/teams/components/MemberManageCard/MandateRoleCard';

interface MemberListProps {
    teamId: string | undefined;
    members: Member[];
    refetch: () => void;
    viewerRole: TeamRole | null;
}

const ROLE_LABEL: Record<Member['role'], string> = {
    ADMIN: '관리자',
    ACCOUNTANT: '총무',
    MEMBER: '멤버',
}

const ROLE_BADGE_STYLE: Record<Member['role'], 'blue' | 'purple' | 'gray'> = {
    ADMIN: 'blue',
    ACCOUNTANT: 'purple',
    MEMBER: 'gray',
}

const MemberList = ({ teamId, members, refetch, viewerRole }: MemberListProps) => {

    const [changeTargetId, setChangeTargetId] = useState<number | null>(null);
    const [isMandateModalOpen, setIsMandateModalOpen] = useState<boolean>(false);
    const [removeTargetId, setRemoveTargetId] = useState<number | null>(null);

    const openChangeModal = (memberId: number) => setChangeTargetId(memberId);
    const closeChangeModal = () => setChangeTargetId(null);

    const openMandateModal = () => setIsMandateModalOpen(true);
    const closeMandateModal = () => setIsMandateModalOpen(false);

    const openRemoveModal = (memberId: number) => setRemoveTargetId(memberId);
    const closeRemoveModal = () => setRemoveTargetId(null);

    return  (
        <div className={styles.listContainer}>
            {members.map((member) => (
                <div className={styles.memberItem} key={member.id}>
                    <div className={styles.itemLeft}>
                        <div className={styles.nameBox}>
                            <p className={styles.name}>{member.name}</p>
                            <Badge
                                text={ROLE_LABEL[member.role]}
                                style={ROLE_BADGE_STYLE[member.role]}
                            />
                        </div>

                        <p className={styles.email}>{member.email}</p>
                    </div>

                    <div className={styles.itemRight}>
                        {viewerRole === 'ADMIN' && (
                            member.role === 'ADMIN' ? (
                                <>
                                    <Button className={styles.mandateBtn} text="권한 위임" onClick={openMandateModal} style="secondary" />

                                    {isMandateModalOpen && (
                                        <div className={styles.modalOverlay}>
                                            <MandateRoleCard
                                                teamId={teamId}
                                                members={members}
                                                onClick={closeMandateModal}
                                                onSuccess={() => {
                                                    closeMandateModal();
                                                    refetch();
                                                }}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Button className={styles.changeBtn} text="권한 변경" onClick={() => openChangeModal(member.id)} style="secondary" />

                                    {changeTargetId === member.id && (
                                        <div className={styles.modalOverlay}>
                                            <ChangeRoleCard
                                                memberId={changeTargetId}
                                                currentRole={member.role === 'ACCOUNTANT' ? 'ACCOUNTANT' : 'MEMBER'}
                                                onClick={closeChangeModal}
                                                onSuccess={() => {
                                                    closeChangeModal();
                                                    refetch();
                                                }}
                                            />
                                        </div>
                                    )}

                                    <Button className={styles.outBtn} text="강퇴" onClick={() => openRemoveModal(member.id)} style="secondary" />

                                    {removeTargetId === member.id && (
                                        <div className={styles.modalOverlay}>
                                            <RemoveMemberCard
                                                memberId={removeTargetId}
                                                onClick={closeRemoveModal}
                                                onSuccess={() => {
                                                    closeRemoveModal();
                                                    refetch();
                                                }}
                                            />
                                        </div>
                                    )}
                                </>
                            )
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MemberList