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
    }[];
}
