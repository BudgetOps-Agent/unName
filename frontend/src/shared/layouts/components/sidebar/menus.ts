import { TeamRole } from "@/types/team";

export const getSidebarMenus = (teamId: string | string[] | undefined, role: TeamRole | null) => {

    const validId = Array.isArray(teamId) ? teamId[0] : teamId;

    if (!validId) {
        return [];
    }

    const menus = [
        {
            text: "대시보드",
            path: `/teams/${validId}/dashboard`,
            icon: "/sidebar/dashboard.svg",
            activeIcon: "/sidebar/dashboard-active.svg",
        },
        {
            text: "지출 내역",
            path: `/teams/${validId}/expenses`,
            icon: "/sidebar/expenses.svg",
            activeIcon: "/sidebar/expenses-active.svg",
        },
        {
            text: "예산 관리",
            path: `/teams/${validId}/budget`,
            icon: "/sidebar/budget.svg",
            activeIcon: "/sidebar/budget-active.svg",
            adminOrAccountantOnly: true,
        },
        {
            text: "멤버",
            path: `/teams/${validId}/members`,
            icon: "/sidebar/member.svg",
            activeIcon: "/sidebar/member-active.svg",
        },
        {
            text: "정산 리포트",
            path: `/teams/${validId}/report`,
            icon: "/sidebar/report.svg",
            activeIcon: "/sidebar/report-active.svg",
            adminOrAccountantOnly: true,
        },
    ];

    // 멤버 권한은 예산 관리/정산 리포트 메뉴를 못 봄 (역할 로딩 전엔 일단 다 보여줌)
    return role === 'MEMBER' ? menus.filter((menu) => !menu.adminOrAccountantOnly) : menus;
};
