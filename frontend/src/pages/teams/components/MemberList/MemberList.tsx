import styles from './memberlist.module.css';
import Button from '@/shared/components/button/Button';
import { Badge } from "@/shared/components/badge/Badge";

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
                            <Button className={styles.mandateBtn} text="권한 위임" style="secondary" />
                        ) : (
                            <>
                                <Button className={styles.changeBtn} text="권한 변경" style="secondary" />
                                <Button className={styles.outBtn} text="강퇴" style="secondary" />
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default MemberList