export interface BudgetResponse {
    success: boolean;
    budget: {
        totalBudget: number;
        usedBudget: number;
        remainingBudget: number;
        usagePercentage: number;
    };
}

export interface UpdateBudgetRequest {
    totalBudget: number;
}

export interface BudgetInsightsResponse {
    success: boolean;
    insights: {
        categoryAnalysis: string | null;
        budgetStatusAnalysis: string | null;
        recommendation: string | null;
        figures: unknown;
        verified: boolean | null;
    };
}
