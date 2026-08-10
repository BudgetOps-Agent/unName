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

export interface AiSummaryResponse {
    success: boolean;
    summary: string | null;
    verified: boolean | null;
}

export interface MonthlyStat {
    month: string;
    amount: number;
}

export interface MonthlyStatsResponse {
    success: boolean;
    statistics: MonthlyStat[];
}
