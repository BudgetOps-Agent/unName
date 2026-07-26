export interface ResponseMyTeams {
    success: true;
    teams: {
        id: number;
        name: string;
        memberCount: number;
        role: 'ADMIN' | 'ACCOUNTANT' | 'MEMBER';
        usedBudget: number;
        totalBudget: number;
        percentage: number;
    }[];
    pending: {
        id: number;
        teamName: string;
        inviteAt: string;
        inviterName: string;
    }[];
}

export interface AcceptInviteResponse {
    success: boolean;
    message: string;
}

export interface RejectInviteResponse {
  success: boolean;
  message: string;
}