import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from "./members.module.css";
import { useTeamMembers } from '../../../../features/teams/hooks/useTeamMembers';
import Button from "@/shared/components/button/Button";
import { Card } from "@/shared/components/card/Card";
import { Badge } from "@/shared/components/badge/Badge";
import InvitationCard from "../../../../features/teams/components/MemberManageCard/InvitationCard";
import ContentTitle from '@/shared/components/contentTitle/ContentTitle';
import MemberSkeleton from '@/features/teams/components/MemberList/MemberSkeleton';
import MemberList from '@/features/teams/components/MemberList/MemberList';

const rolelist = [
    {
        id: 1,
        role: '관리자',
        content: '예산 관리, 멤버 초대ㆍ강퇴, 모든 지출 승인ㆍ반려, 관리자 권한 위임, 정산 리포트 조회, 모든 지출 내역 조회, 회칙 변경'
    },
    {
        id: 2,
        role: '총무',
        content: '지출 승인ㆍ반려, 예산 항목 관리, 정산 리포트 조회'
    },
    {
        id: 3,
        role: '멤버',
        content: '지출 요청, 내 지출 내역 조회'
    },
]

const Members = () => {

    const router = useRouter();
    const { teamId } = router.query;
    const validTeamId = typeof teamId === 'string' ? teamId : undefined;

    const isRouterLoading = !router.isReady;

    const { members, isLoading, error, refetch } = useTeamMembers(validTeamId);
    
    const isPageLoading = isRouterLoading || isLoading;
    
    const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);

    const openInviteModal = () => setIsInviteModalOpen(true);
    const closeInviteModal = () => setIsInviteModalOpen(false);

    return (
        <>
            <ContentTitle title="멤버" subTitle={`총 ${members.length}명이에요`} onClick={openInviteModal} btnText="초대하기" />

            {isInviteModalOpen && (
                <div className={styles.modalOverlay}>
                    <InvitationCard teamId={validTeamId} onClick={closeInviteModal} onSuccess={closeInviteModal} />
                </div>
            )}

            <Card className={styles.membersCard} noPadding={true}>
                {isPageLoading ? (
                    <MemberSkeleton />
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <p className={styles.errorTextTitle}>⚠️ 멤버 정보를 불러오지 못했습니다</p>
                        <p className={styles.errorTextSub}>{error}</p>
                        <Button className={styles.errorBtn} text="다시 시도" onClick={() => refetch()} style="tertiary" />
                    </div>
                ) : (
                    <MemberList teamId={validTeamId} members={members} refetch={refetch} />
                )}
            </Card>

            <Card className={styles.roleGuide}>
                <span className={styles.guideTitle}>역할 안내</span>

                <div className={styles.guideContent}>
                    {rolelist.map((role) => (
                        <div className={styles.roleItem} key={role.id}>
                            <Badge
                                text={role.role}
                                style={
                                    role.role === '관리자' ? 'blue'
                                        : role.role === '총무' ? 'purple'
                                            : 'gray'
                                }
                            />
                            <p className={styles.roleContent}>{role.content}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </>
    )
}

export default Members