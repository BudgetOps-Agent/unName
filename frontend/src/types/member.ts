export interface Member {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface UseTeamMembersResult {
    success: boolean;
    status?: number;
    message?: string;
    data?: Member[];
}