import { TeamRole } from "@/types/team";

export const getSidebarMenus = (teamId: string | string[] | undefined, role: TeamRole | null) => {

    const validId = Array.isArray(teamId) ? teamId[0] : teamId;

    if (!validId) {
        return [];
    }

    // mobileText — 하단 탭바는 폭이 좁아서 두 글자 안팎으로 줄인 이름을 씀
    const menus = [
        {
            text: "대시보드",
            mobileText: "홈",
            path: `/teams/${validId}/dashboard`,
            icon: "/sidebar/dashboard.svg",
            activeIcon: "/sidebar/dashboard-active.svg",
        },
        {
            text: "지출 내역",
            mobileText: "지출",
            path: `/teams/${validId}/expenses`,
            icon: "/sidebar/expenses.svg",
            activeIcon: "/sidebar/expenses-active.svg",
        },
        {
            text: "모임 관리",
            mobileText: "모임관리",
            path: `/teams/${validId}/budget`,
            icon: "/sidebar/budget.svg",
            activeIcon: "/sidebar/budget-active.svg",
            adminOrAccountantOnly: true,
        },
        {
            text: "멤버",
            mobileText: "멤버",
            path: `/teams/${validId}/members`,
            icon: "/sidebar/member.svg",
            activeIcon: "/sidebar/member-active.svg",
        },
        {
            text: "정산 리포트",
            mobileText: "리포트",
            path: `/teams/${validId}/report`,
            icon: "/sidebar/report.svg",
            activeIcon: "/sidebar/report-active.svg",
        },
    ];

    // 멤버 권한은 예산 관리 메뉴를 못 봄 (역할 로딩 전엔 일단 다 보여줌)
    // 정산 리포트는 팀원이면 역할 무관하게 열람 가능 (백엔드 API-050/051도 소속 검사만 함)
    return role === 'MEMBER' ? menus.filter((menu) => !menu.adminOrAccountantOnly) : menus;
};