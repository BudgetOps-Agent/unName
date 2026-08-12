export interface ReportExpense {
    id: number;
    title: string;
    category: string;
    requesterName: string;
    // 승인/반려를 처리한 사람 이름 (AI 자동처리면 "AI")
    processorName: string | null;
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