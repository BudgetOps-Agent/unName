import Link from 'next/link';
import styles from './grouplist.module.css';
import { Badge } from '@/shared/components/badge/Badge';

export interface Group {
    teamId: number;
    name: string;
    memberCount: number;
    role: 'ADMIN' | 'ACCOUNTANT' | 'MEMBER';
}

export interface GroupListProps {
    groups: Group[];
}

const roleLabel: Record<Group['role'], string> = {
    ADMIN: '관리자',
    ACCOUNTANT: '총무',
    MEMBER: '멤버',
};

const roleBadgeStyle: Record<Group['role'], 'blue' | 'purple' | 'gray'> = {
    ADMIN: 'blue',
    ACCOUNTANT: 'purple',
    MEMBER: 'gray',
};

const GroupList = ({ groups }: GroupListProps) => {
    return (
        <div className={styles.grouplistContainer}>
            <div className={styles.grouplistHeader}>
                <span>내 모임</span>
            </div>

            <div className={styles.grouplistItems}>
                {groups.map((group) => (
                    <Link
                        href={`/teams/${group.teamId}/dashboard`}
                        className={styles.itemBox}
                        key={group.teamId}
                    >
                        <div className={styles.boxLeft}>
                            <div className={styles.groupInfo}>
                                <p className={styles.groupName}>{group.name}</p>
                                <p className={styles.memberCount}>멤버 {group.memberCount}명</p>
                            </div>
                        </div>

                        <div className={styles.boxRight}>
                            <Badge text={roleLabel[group.role]} style={roleBadgeStyle[group.role]} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default GroupList
