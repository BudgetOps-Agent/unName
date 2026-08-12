import Link from "next/link";
import { useState } from "react";
import styles from "./mypage.module.css";
import { Card } from "@/shared/components/card/Card";
import Button from "@/shared/components/button/Button";
import UserProfile from "@/shared/components/userProfile/UserProfile";
import GroupList from "@/shared/components/groupList/GroupList";
import LeaveTeamCard from "@/features/teams/components/LeaveTeamCard/LeaveTeamCard";
import MandateRoleCard from "@/features/teams/components/MemberManageCard/MandateRoleCard";
import { useRouter } from "next/router";
import { useMyPage } from "@/features/mypage/hooks/useMyPage";
import { useTeamMembers } from "@/features/teams/hooks/useTeamMembers";
import useLeaveTeam from "@/features/teams/hooks/useLeaveTeam";
import useDeleteTeam from "@/features/teams/hooks/useDeleteTeam";

const Mypage = () => {

    const router = useRouter();
    const { from } = router.query;
    // 마이페이지는 팀 안에서 들어오면 ?from=teamId가 붙는다. 탈퇴 대상은 그 팀
    const currentTeamId = typeof from === 'string' && from !== '' ? from : undefined;

    const { user, teams, isLoading, error, refetch } = useMyPage();
    const { members } = useTeamMembers(currentTeamId);
    const { isSubmitting: isLeaving, submitLeave } = useLeaveTeam(currentTeamId);
    const { isSubmitting: isDeleting, submitDelete } = useDeleteTeam(currentTeamId);

    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isMandateModalOpen, setIsMandateModalOpen] = useState(false);

    const currentTeam = teams.find((team) => String(team.teamId) === currentTeamId);
    const isAdmin = currentTeam?.role === 'ADMIN';
    // 관리자 혼자면 넘길 사람도 나갈 모임도 없어서, 탈퇴 대신 모임 자체를 지운다 (API-053)
    const isLastMember = isAdmin && currentTeam?.memberCount === 1;

    const closeModals = () => {
        setIsLeaveModalOpen(false);
        setIsMandateModalOpen(false);
    };

    const leaveTeamAndGoBack = async () => {
        const result = await submitLeave();

        alert(result.message);

        if (result.success) {
            closeModals();
            router.push('/teams');
        }
    };

    const deleteTeamAndGoBack = async () => {
        const result = await submitDelete();

        alert(result.message);

        if (result.success) {
            closeModals();
            router.push('/teams');
        }
    };

    // 관리자는 관리자 없는 모임이 생기지 않도록 권한 위임을 먼저 거쳐야 함 (백엔드도 동일하게 막음)
    const handleLeaveClick = () => {
        if (isAdmin && !isLastMember) {
            setIsMandateModalOpen(true);
            return;
        }

        setIsLeaveModalOpen(true);
    };

    return (
        <div className={styles.myPageContainer}>
            <Link href={from ? `/teams/${from}/dashboard` : "/teams"} className={`link-back ${styles.backLink}`}><span>{from ? "대시보드" : "내 모임"}</span></Link>
            {error ? (
                <Card className={styles.errorCard}>
                    <div className={styles.errorContainer}>
                        <p className={styles.errorTextTitle}>⚠️ 마이페이지 정보를 불러오지 못했습니다</p>
                        <p className={styles.errorTextSub}>{error}</p>
                        <Button text="다시 시도" onClick={() => refetch()} style="tertiary" size="md" />
                    </div>
                </Card>
            ) : teams.length === 0 ? (
                    <Card className={styles.grouplistCard} noPadding={true} noData="가입한 팀이 없어요" />
            ) : (
                <>
                    <Card className={styles.profileCard}>
                        <UserProfile user={user ?? undefined} isLoading={isLoading} />
                    </Card>

                    <Card className={styles.grouplistCard} noPadding={true}>
                        <GroupList groups={teams} />
                    </Card>
                </>
            )}

            {/* 어느 모임을 나갈지는 ?from으로 정해지므로, 모임 밖에서 들어왔으면 버튼을 숨긴다 */}
            {currentTeam && (
                <button type="button" onClick={handleLeaveClick} className={styles.leaveTeam}>
                    <p>{isLastMember ? '모임 삭제' : '모임 탈퇴'}</p>
                </button>
            )}

            {isMandateModalOpen && (
                <div className={styles.modalOverlay}>
                    <MandateRoleCard
                        teamId={currentTeamId}
                        members={members}
                        description={<>관리자는 권한을 위임해야 모임에서 나갈 수 있어요.<br />위임이 끝나면 바로 모임에서 나가요.</>}
                        onClick={() => setIsMandateModalOpen(false)}
                        // 위임이 끝나야 관리자 자리가 비지 않으므로, 성공한 뒤에 이어서 탈퇴
                        onSuccess={leaveTeamAndGoBack}
                    />
                </div>
            )}

            {isLeaveModalOpen && (
                <div className={styles.modalOverlay}>
                    <LeaveTeamCard
                        mode={isLastMember ? 'delete' : 'leave'}
                        teamName={currentTeam?.name}
                        onClose={() => setIsLeaveModalOpen(false)}
                        onConfirm={isLastMember ? deleteTeamAndGoBack : leaveTeamAndGoBack}
                        isSubmitting={isLastMember ? isDeleting : isLeaving}
                    />
                </div>
            )}
        </div>
    )
}

export default Mypage