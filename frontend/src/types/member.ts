export interface Member {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'ACCOUNTANT' | 'MEMBER';
}

export interface ResponseTeamMembers {
    success: boolean;
    members: Member[];
}

export interface UseTeamMembersResult {
    success: boolean;
    status?: number;
    message?: string;
    data?: Member[];
}