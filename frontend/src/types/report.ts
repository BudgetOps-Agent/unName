export interface ReportExpense {
    id: number;
    item: string;
    title: string;
    category: string;
    requesterName: string;
    date: string;
    amount: number;
}

export interface Report {
  approvedCount: number;
  expenses: ReportExpense[];
  remainingBudget: number;
  totalBudget: number;
  totalExpense: number;
  usagePercentage: number;
  usedBudget: number;
}

export interface ResponseReport {
  success: boolean;
  report: Report;
}