import Link from "next/link";
import Dropdown from "@/shared/components/dropdown/Dropdown";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { logout, mypage } from "@/pages/auth/api/authApi";

const noticelist = [
    {
        "id": 1,
        "type": "request",
        "status": "pending",
        "title": "해커톤 참가비 승인 요청",
        "content": "이서연님이 방금 요청했어요",
        "time": "10분 전",
        "hasButton": true
    },
    {
        "id": 2,
        "type": "request",
        "status": "pending",
        "title": "외부 강사 강연료 승인 요청",
        "content": "박지호님이 요청했어요 — 위험도 높음",
        "time": "1시간 전",
        "hasButton": true
    },
    {
        "id": 3,
        "type": "notice",
        "status": "approved",
        "title": "노션 팀 플랜 승인됐어요",
        "content": "이서연 총무님이 승인했어요",
        "time": "3시간 전",
        "hasButton": false
    },
    {
        "id": 4,
        "type": "request",
        "status": "pending",
        "title": "포스터 인쇄비 승인 요청",
        "content": "정다은님이 요청했어요",
        "time": "5일 전",
        "hasButton": true
    }
]

const ROLE_LABEL: Record<string, string> = {
    ADMIN: "관리자",
    ACCOUNTANT: "총무",
    MEMBER: "멤버",
} 

const Header = () => {

    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    const pendingCount = noticelist.filter((item) => item.status === 'pending').length;

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
                    iconLeft={<img src="/header/notice.svg" alt="notice" />}
                    headerContent={
                        <div className="notice-header">
                            <span className="title">알림</span>
                            <span className="badge">{pendingCount}건 대기</span>
                        </div>
                    }
                    items={noticelist}
                    renderItem={(item, index) => (
                        <div className={`notice-item ${item.status === 'pending' ? 'pending' : ''}`}>
                            {item.type === 'request' 
                            ? <span className="notice-item-icon request"><img className="request" src="/header/notice-yellow.svg" alt="request" /></span>
                            : <span className="notice-item-icon approved"><img className="approved" src="/header/check-green.svg" alt="approved" /></span>}

                            <div className="notice-item-info">
                                <span className="notice-item-title ellipsis">{item.title}</span>
                                <span className="notice-item-content ellipsis-2">{item.content}</span>
                                <span className="notice-item-time">{item.time}</span>
                            </div>

                            {item.status === 'pending' && <Link key={index} href={`/teams/1/expenses/${item.id}`} className="btn-primary btn-sm">검토하기</Link>}
                        </div>
                    )}
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