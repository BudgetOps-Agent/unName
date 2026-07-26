import { useState } from 'react';
import styles from './teams.module.css';
import InviteCard from './components/InviteCard/InviteCard';
import GroupCard from './components/GroupCard/GroupCard';
import useMyTeams from './hooks/useMyTeams';
import { Card } from '@/shared/components/card/Card';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/router';
import useInviteActions from './hooks/useInviteActions';
import ContentTitle from '@/shared/components/contentTitle/ContentTitle';

const Teams = () => {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const { groupInfo, inviteInfo, isLoading, error, refetch } = useMyTeams();
    const { handleAccept, handleReject, loadingId, error: inviteError, errorId } = useInviteActions();
    const [isHoverd, setIsHoverd] = useState(false);
    
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("로그아웃 요청 실패:", error);
        } finally {
            clearAuth();
            router.push('/auth/signin');
        }
    };

    return (
        <div className={styles.teamsContainer}>
            <ContentTitle title="내모임" subTitle="참여 중인 모임이에요" href="/teams/new" btnText="새 모임"/>

            <div className={styles.inviteListSection}>
                <p className={styles.inviteAlarm}>
                    받은 초대
                    <span className={styles.inviteCount}>{inviteInfo.length}</span>
                </p>
                
                {isLoading ? (
                    <>
                        <InviteCard isLoading />
                    </>
                ) : error ? (
                    <Card><p className={styles.error}>{error}</p></Card>
                ) : inviteInfo.length === 0 ? (
                    <Card>
                        <p className={styles.empty}>받은 초대가 없어요. 새로운 초대를 기다려보세요!</p>
                    </Card>
                ) : (
                    inviteInfo.map((invitation) => (
                        <InviteCard 
                            key={invitation.id} 
                            invitation={invitation} 
                            onAccept={async() => {
                                const success = await handleAccept(invitation.id) 
                                if (success) {
                                    refetch();
                                }
                            }} 
                            onReject={async() => {
                                const reject = await handleReject(invitation.id) 
                                if (reject) {
                                    refetch();
                                }
                            }}  
                            isPending={loadingId === invitation.id} 
                            errorMsg={errorId === invitation.id ? inviteError : undefined}
                        />
                    ))
            )}
            </div>
            
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
                    onClick={handleLogout}
                >
                    <Image 
                        src={isHoverd ? "/logout-gray-hover.svg" : "/logout-gray.svg"}
                        alt="로그아웃"
                        width={16} height={16}
                    />
                    <p>로그아웃</p>
                </button>
            </div>
        </div>
    )
}

export default Teams