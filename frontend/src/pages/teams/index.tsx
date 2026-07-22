import { useState } from 'react';
import styles from './teams.module.css';
import Link from 'next/link';
import InviteCard from './components/InviteCard/InviteCard';
import GroupCard from './components/GroupCard/GroupCard';
import useMyTeams from './hooks/useMyTeams';
import { Card } from '@/shared/components/card/Card';

const inviteInfo = [
    {
        id: 1,
        name: 'AI 연구 동아리',
        inviter: '이정민',
    },
    {
        id: 2,
        name: '사이드 프로젝트 팀',
        inviter: '최준혁',
    },
]

const Teams = () => {

    const { groupInfo, isLoading, error } = useMyTeams();
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
                {isLoading ? (
                    <>
                        <GroupCard isLoading />
                        <GroupCard isLoading />
                        <GroupCard isLoading />
                    </>
                ) : error ? (
                    <Card><p className={styles.error}>{error}</p></Card>
                ) : groupInfo.length === 0 ? (
                    <Card>
                        <p className={styles.empty}>아직 속한 모임이 없어요. 새 모임을 만들어보세요.</p>
                    </Card>
                ) : (
                    groupInfo.map((group) => (
                        <GroupCard key={group.id} group={group} />
                    ))
                )}
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