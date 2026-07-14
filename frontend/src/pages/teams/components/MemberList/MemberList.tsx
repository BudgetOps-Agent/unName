import { useState } from 'react';
import styles from './memberlist.module.css';
import Button from '@/shared/components/button/Button';
import { Badge } from "@/shared/components/badge/Badge";
import ChangeRoleCard from '../MemberManageCard/ChangeRoleCard';
import MandateRoleCard from '../MemberManageCard/MandateRoleCard';
import RemoveMemberCard from '../MemberManageCard/RemoveMemberCard';

interface Member {
    id: number;
    name: string;
    role: string;
    email: string;
}

interface MemberListProps {
    members: Member[];
}

const MemberList = ({ members }: MemberListProps) => {

    const [isChangeModalOpen, setIsChangeModalOpen] = useState<boolean>(false);
    const [isMandateModalOpen, setIsMandateModalOpen] = useState<boolean>(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState<boolean>(false);

    const openChangeModal = () => setIsChangeModalOpen(true);
    const closeChangeModal = () => setIsChangeModalOpen(false);

    const openMandateModal = () => setIsMandateModalOpen(true);
    const closeMandateModal = () => setIsMandateModalOpen(false);

    const openRemoveModal = () => setIsRemoveModalOpen(true);
    const closeRemoveModal = () => setIsRemoveModalOpen(false);

    return  (
        <div className={styles.listContainer}>
            {members.map((member) => (
                <div className={styles.memberItem} key={member.id}>
                    <div className={styles.itemLeft}>
                        <div className={styles.nameBox}>
                            <p className={styles.name}>{member.name}</p>
                            <Badge 
                                text={member.role}
                                style = {
                                    member.role === '관리자' ? 'blue'
                                    : member.role === '총무' ? 'purple'
                                    : 'gray'
                                }
                            />
                        </div>

                        <p className={styles.email}>{member.email}</p>
                    </div>

                    <div className={styles.itemRight}>
                        {member.role === '관리자' ? (
                            <>
                                <Button className={styles.mandateBtn} text="권한 위임" onClick={openMandateModal} style="secondary" />

                                {isMandateModalOpen && (
                                    <div className={styles.modalOverlay}>
                                        <MandateRoleCard members={members} onClick={closeMandateModal} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <Button className={styles.changeBtn} text="권한 변경" onClick={openChangeModal} style="secondary" />

                                {isChangeModalOpen && (
                                    <div className={styles.modalOverlay}>
                                        <ChangeRoleCard onClick={closeChangeModal} />
                                    </div>
                                )}

                                <Button className={styles.outBtn} text="강퇴" onClick={openRemoveModal} style="secondary" />

                                {isRemoveModalOpen && (
                                    <div className={styles.modalOverlay}>
                                        <RemoveMemberCard onClick={closeRemoveModal} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MemberList