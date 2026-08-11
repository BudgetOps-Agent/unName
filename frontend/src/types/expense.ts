export interface ExpenseCreateResponse {
    success: boolean;
    expenseId: number;
    status: 'SUBMITTED' | 'ESCALATED' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

export interface ExpenseApproveResponse {
    success: boolean;
    status: 'APPROVED';
    approvedAt: string;
}

export interface ExpenseRejectResponse {
    success: boolean;
    status: 'REJECTED';
    approvedAt: string;
}

export interface ExpenseDeleteResponse {
    success: boolean;
    message: string;
}

export interface ExpenseDetailResponse {
    success: boolean;
    expense: {
        id: number;
        title: string;
        amount: number;
        category: string | null;
        description: string | null;
        receiptFileUrl: string | null;
        status: 'SUBMITTED' | 'ESCALATED' | 'APPROVED' | 'REJECTED';
        requesterName: string;
        createdAt: string;
        approvedAt: string | null;
        rejectReason: string | null;
        expenseDate: string;
        // 조회자 기준 동작 가능 여부 (버튼 노출용 힌트, 실제 권한은 서버가 재검증)
        canEdit: boolean;
        canDelete: boolean;
        canApprove: boolean;
        canReject: boolean;
    };
}

export interface ExpenseUpdateResponse {
    success: boolean;
    expense: {
        id: number;
        title: string;
        amount: number;
        category: string | null;
        description: string | null;
        receiptFileUrl: string | null;
        status: 'SUBMITTED' | 'ESCALATED' | 'APPROVED' | 'REJECTED';
        updatedAt: string;
    };
}

export interface CategoryStatsResponse {
    success: boolean;
    statistics: {
        category: string;
        amount: number;
    }[];
}

export interface ExpenseReviewResultResponse {
    success: boolean;
    review: {
        reviewers: {
            id: number;
            verdict: 'PASS' | 'FAIL' | 'HOLD';
            opinion: string;
            reason: string;
        }[];
        finalVerdict: 'SUBMITTED' | 'ESCALATED' | 'APPROVED' | 'REJECTED';
        processType: 'AUTO' | 'ESCALATED';
        processor: string;
        category: string;
    } | null;
}

export interface ResponseExpenses {
    success: boolean;
    counts: {
        all: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    expenses: {
        id: number;
        title: string;
        amount: number;
        status: 'SUBMITTED' | 'ESCALATED' | 'APPROVED' | 'REJECTED';
        requesterName: string;
        date: string;
        // 최종 처리 주체. 승인/반려 결정 전(대기·에스컬레이션)에는 null
        processedBy: 'AI' | 'HUMAN' | null;
    }[];
}

export interface Expense {
    id: number;
    title: string;
    category: string;
    requesterName: string;
    date: string;
    amount: number;
}