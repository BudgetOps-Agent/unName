import styles from './teams.module.css';
import Link from 'next/link';
import GroupCard from './components/GroupCard/GroupCard';

const groupInfo = [
    { 
        id: 1,
        name: 'GDSC 한양대학교', 
        member: 24, 
        role: '관리자', 
        budget: 5000000, 
        usedBudget: 2293000
    },
    { 
        id: 2,
        name: '스타트업 스터디', 
        member: 8, 
        role: '멤버', 
        budget: 800000, 
        usedBudget: 320000
    },
];

const Teams = () => {
    return (
        <div className={styles.teamsContainer}>
            <div className={styles.teamsHeader}>
                <div className={styles.headerLeft}>
                    <p className={styles.title}>내 모임</p>
                    <p className={styles.subTitle}>참여 중인 모임이에요</p>
                </div>

                <Link className={styles.newTeamBtn} href={`/teams/new`}>+ 새 모임</Link>
            </div>

            <div className={styles.groupListSection}>
                {groupInfo.map((group) => (
                    <GroupCard key={group.id} group={group} />
                ))}
            </div>
        </div>
    )
}

export default Teams