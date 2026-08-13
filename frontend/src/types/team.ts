export type TeamType = '동아리_학생회' | '스터디' | '친목' | '동호회' | '회사';

export type TeamRole = 'ADMIN' | 'ACCOUNTANT' | 'MEMBER';

export interface CreateTeamRequest {
    name: string;
    teamType: TeamType;
    totalBudget: number;
    description?: string;
}

export interface CreateTeamResponse {
    success: boolean;
    team: {
        id: number;
        name: string;
        teamType: TeamType;
        description: string;
        totalBudget: number;
        usedBudget: number;
        adminId: number;
        createdAt: string;
    };
}

export interface UpdateTeamSettingsRequest {
    membershipFee?: number;
    autoApprove?: boolean;
    autoApproveLimit?: number;
}

export interface UpdateTeamSettingsResponse {
    success: boolean;
}

export interface TeamSettings {
    membershipFee: number;
    autoApprove: boolean;
    // autoApprove가 false면 null (모든 지출을 관리자가 직접 확인하는 모드)
    autoApproveLimit: number | null;
}

export interface TeamSettingsResponse {
    success: boolean;
    settings: TeamSettings;
}

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
        invitedAt: string;
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

export interface InviteMemberResponse {
  success: boolean;
  message: string;
}

export interface TransferAdminResponse {
  success: boolean;
  message: string;
}

export interface RemoveMemberResponse {
  success: boolean;
  message: string;
}

// API-043 본인이 모임에서 나가기. 관리자는 권한 위임 후에만 가능
export interface LeaveTeamResponse {
  success: boolean;
  message: string;
}

// API-053 모임 전체 삭제. 관리자 혼자 남았을 때만 가능하고, 다른 멤버가 있으면 409
export interface DeleteTeamResponse {
  success: boolean;
  message: string;
}

export interface ChangeRoleResponse {
  success: boolean;
  member: {
    id: number;
    name: string;
    role: string;
  };
}