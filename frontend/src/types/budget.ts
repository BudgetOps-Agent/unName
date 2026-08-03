export interface BudgetResponse {
    success: boolean;
    budget: {
        totalBudget: number;
        usedBudget: number;
        remainingBudget: number;
    };
}

export interface UpdateBudgetRequest {
    totalBudget: number;
}
