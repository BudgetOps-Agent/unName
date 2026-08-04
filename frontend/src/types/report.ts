export interface ReportExpense {
    id: number;
    title: string;
    category: string;
    requesterName: string;
    date: string;
    amount: number;
}

export interface Report {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  expenses: ReportExpense[];
}

export interface ResponseReport extends Report {
  success: boolean;
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