import { useState } from 'react';
import styles from './teams.module.css';
import Link from 'next/link';
import InviteCard from './components/InviteCard/InviteCard';
import GroupCard from './components/GroupCard/GroupCard';

const inviteInfo = [
    {
        id: 1,
        name: 'AI 연구 동아리',
        inviter: '이정민',
        category: '동아리/학생회',
        member: 12,
        budget: 2000000,
        role: '멤버'
    },
    {
        id: 2,
        name: '사이드 프로젝트 팀',
        inviter: '최준혁',
        category: '스터디',
        member: 6,
        budget: 500000,
        role: '총무'
    },
]

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

    const [isHoverd, setIsHoverd] = useState(false);

    return (
        <div className={styles.teamsContainer}>
            <div className={styles.teamsHeader}>
                <div className={styles.headerLeft}>
                    <p className={styles.title}>내 모임</p>
                    <p className={styles.subTitle}>참여 중인 모임이에요</p>
                </div>

                <Link className={styles.newTeamBtn} href={`/teams/new`}>+ 새 모임</Link>
            </div>

            {inviteInfo && inviteInfo.length > 0 && (
                <div className={styles.inviteListSection}>
                    <p className={styles.inviteAlarm}>
                        받은 초대
                        <span className={styles.inviteCount}>{inviteInfo.length}</span>
                    </p>
                    
                    {inviteInfo.map((invitation) => (
                        <InviteCard key={invitation.id} invitation={invitation} />
                    ))}
                </div>
            )}

            <div className={styles.groupListSection}>
                {groupInfo.map((group) => (
                    <GroupCard key={group.id} group={group} />
                ))}
            </div>

            <div className={styles.logoutBtnSection}>
                <button
                    className={styles.logoutBtn}
                    onMouseEnter={() => setIsHoverd(true)}
                    onMouseLeave={() => setIsHoverd(false)}
                >
                    <img 
                        src={isHoverd ? "/logout-gray-hover.svg" : "/logout-gray.svg"}
                        alt="로그아웃"
                    />
                    <p>로그아웃</p>
                </button>
            </div>
        </div>
    )
}

export default Teams