import Link from "next/link";
import Dropdown from "@/shared/components/dropdown/Dropdown";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { logout, mypage } from "@/features/auth/api/authApi";
import useNotifications from "@/features/notifications/hooks/useNotifications";
import { NotificationType } from "@/types/notification";

const NOTIFICATION_ICON: Record<NotificationType, { src: string; className: string }> = {
    APPROVAL_REQUEST: { src: '/header/notice-yellow.svg', className: 'request' },
    APPROVED: { src: '/header/check-green.svg', className: 'approved' },
    REJECTED: { src: '/fail-icon.svg', className: 'reject' },
};

const NOTIFICATION_TEXT: Record<NotificationType, (expenseTitle: string, actorName: string | null) => { title: string; content: string }> = {
    APPROVAL_REQUEST: (expenseTitle, actorName) => ({
        title: `${expenseTitle} 승인 요청`,
        content: `${actorName}님이 요청했어요`,
    }),
    APPROVED: (expenseTitle, actorName) => ({
        title: `${expenseTitle} 승인됐어요`,
        content: actorName ? `${actorName}님이 승인했어요` : 'AI가 자동으로 승인했어요',
    }),
    REJECTED: (expenseTitle, actorName) => ({
        title: `${expenseTitle} 반려됐어요`,
        content: actorName ? `${actorName}님이 반려했어요` : 'AI가 자동으로 반려했어요',
    }),
};

const formatNotificationTime = (createdAt: string) => {
    if (!createdAt) return '';

    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}일 전`;

    return createdAt.slice(0, 10);
};

const ROLE_LABEL: Record<string, string> = {
    ADMIN: "관리자",
    ACCOUNTANT: "총무",
    MEMBER: "멤버",
}

const Header = () => {

    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    const { notifications, markAsRead } = useNotifications();
    const pendingCount = notifications.length;

    const userName = user?.user?.name ?? "";

    const { teamId, from } = router.query;
    const effectiveTeamId = teamId ?? from;
    const [teamRoleLabel, setTeamRoleLabel] = useState("");
    const [myTeams, setMyTeams] = useState<{ teamId: number; name: string; role: string }[]>([]);

    useEffect(() => {
        let isCancelled = false;

        const fetchMyTeams = async () => {
            try {
                const response = await mypage();
                const teams = response.data.teams;

                if (!isCancelled) {
                    setMyTeams(teams);

                    const currentTeam = teams.find((team) => String(team.teamId) === String(effectiveTeamId));
                    setTeamRoleLabel(
                        currentTeam ? (ROLE_LABEL[currentTeam.role] ?? currentTeam.role) : ""
                    );
                }
            } catch (error) {
                console.error("유저 정보 조회 실패:", error);
                if (!isCancelled) {
                    setMyTeams([]);
                    setTeamRoleLabel("");
                }
            }
        };

        fetchMyTeams();

        return () => {
            isCancelled = true;
        };
    }, [effectiveTeamId]);

    const userRole = teamRoleLabel;
    const currentTeamName = myTeams.find((team) => String(team.teamId) === String(effectiveTeamId))?.name ?? "모임 선택";

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
        <header className="header-container">
            <div className="header-left">
                <Dropdown
                    text={<p className="ellipsis">{currentTeamName}</p>}
                    className="grouplist"
                    iconOnly={false}
                    iconRight={<img src="/header/vector.svg" alt="vector" />}
                    items={myTeams}
                    value={effectiveTeamId}
                    getItemValue={(item) => item.teamId}
                    renderItem={(item, index) => (
                        <Link 
                            key={index}
                            href={`/teams/${item.teamId}/dashboard`}
                            className="grouplist-item"
                        >
                            <div className="grouplist-item-info">
                                <span className="grouplist-item-name ellipsis">{item.name}</span>
                                <span className="grouplist-item-member">{ROLE_LABEL[item.role] ?? item.role}</span>
                            </div>
                        </Link>
                    )}
                    footerContent={
                        <Link
                            href="/teams/new"
                            className="grouplist-footer"
                        >
                            <span className="grouplist-footer-icon">+</span>
                            <span className="grouplist-footer-text">새 모임 만들기</span>
                        </Link>
                    }
                />
            </div>
            <div className="header-right">
                <Dropdown
                    text="알림"
                    className="notice"
                    iconOnly={true}
                    iconLeft={
                        <>
                            <img className="notice-icon-default" src="/header/notice.svg" alt="notice" />
                            <img className="notice-icon-active" src="/header/notice-blue.svg" alt="notice" />
                        </>
                    }
                    badge={pendingCount > 0 && <span className="notice-count-badge">{pendingCount}</span>}
                    emptyContent={<p className="notice-empty">새 알림이 없어요</p>}
                    headerContent={
                        <div className="notice-header">
                            <span className="title">알림</span>
                            <span className="badge">{pendingCount}건 대기</span>
                        </div>
                    }
                    items={notifications}
                    renderItem={(item, index) => {
                        const icon = NOTIFICATION_ICON[item.type as NotificationType];
                        const { title, content } = NOTIFICATION_TEXT[item.type as NotificationType](item.expenseTitle, item.actorName);

                        const itemBody = (
                            <>
                                <span className={`notice-item-icon ${icon.className}`}>
                                    <img className={icon.className} src={icon.src} alt={item.type} />
                                </span>

                                <div className="notice-item-info">
                                    <span className="notice-item-title ellipsis">{title}</span>
                                    <span className="notice-item-content ellipsis-2">{content}</span>
                                    {/* 여러 팀 알림이 한 목록에 섞이므로 어느 팀 알림인지 시간 앞에 같이 보여줌 */}
                                    <span className="notice-item-time ellipsis">
                                        {item.teamName ? `${item.teamName} · ${formatNotificationTime(item.createdAt)}` : formatNotificationTime(item.createdAt)}
                                    </span>
                                </div>

                                {item.type === 'APPROVAL_REQUEST' && (
                                    <span className="btn-primary btn-sm">검토하기</span>
                                )}
                            </>
                        );

                        return item.expenseId ? (
                            <Link
                                // 알림이 속한 팀으로 이동 (다른 팀 알림을 눌러도 팀이 같이 바뀌도록)
                                href={`/teams/${item.teamId ?? effectiveTeamId ?? ''}/expenses/${item.expenseId}`}
                                className={`notice-item ${!item.isRead ? 'pending' : ''}`}
                                onClick={() => markAsRead(item.id)}
                            >
                                {itemBody}
                            </Link>
                        ) : (
                            <div
                                className={`notice-item ${!item.isRead ? 'pending' : ''}`}
                                onClick={() => markAsRead(item.id)}
                            >
                                {itemBody}
                            </div>
                        );
                    }}
                />

                <Dropdown
                    text={<><strong className="ellipsis">{userName}</strong> <span>{userRole}</span></>}
                    className="user"
                    iconOnly={false}
                    headerContent={
                        <div className="user-info">
                            <span className="user-info-name">{userName}</span>
                            <span className="user-info-role">{userRole}</span>
                        </div>
                    }
                    items={[
                        {
                            menu: "마이페이지",
                            classname: "mypage",
                            href: `/mypage?from=${effectiveTeamId ?? ''}`,
                            icon: "/header/mypage.svg",
                        },
                        {
                            menu: "로그아웃",
                            classname: "logout",
                            href: "/login",
                            icon: "/header/logout.svg",
                        }
                    ]}
                    renderItem={(item, index) => (
                        item.classname === "logout" ? (
                            <button
                                key={index}
                                type="button"
                                onClick={handleLogout}
                                className={`user-menu ${item.classname}`}
                            >
                                <span className="user-menu-text">{item.menu}</span>
                            </button>
                        ) : (
                            <Link
                                key={index}
                                href={item.href}
                                className={`user-menu ${item.classname}`}
                            >
                                <span className="user-menu-text">{item.menu}</span>
                            </Link>
                        )
                    )}
                />
            </div>
        </header>
    )
}


export default Header