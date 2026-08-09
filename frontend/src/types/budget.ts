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
