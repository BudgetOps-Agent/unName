export const getSidebarMenus = (teamId: string | string[] | undefined) => {
    
    const validId = Array.isArray(teamId) ? teamId[0] : teamId;
    
    if (!validId) {
        return [];
    }
    
    return  [
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
        },
    ];
};