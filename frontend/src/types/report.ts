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

export interface ReportSummary {
  totalExpense: number;
  approvedCount: number;
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  usagePercentage: number;
}

export interface ResponseReportSummary extends ReportSummary {
  success: boolean;
}