export interface DashboardResponse {
    success: boolean;
    dashboard: {
        totalBudget: number;
        usedBudget: number;
        remainingBudget: number;
        usagePercentage: number;
        memberCount: number;
        pendingApprovalCount: number;
        pendingAmount: number;
        recentExpenses: {
            id: number;
            title: string;
            amount: number;
            status: string;
            date: string;
            requesterName?: string;
        }[];
    };
}
