import api from "@/shared/api/api";
import { AcceptInviteResponse, RejectInviteResponse, InviteMemberResponse, TransferAdminResponse, RemoveMemberResponse, ChangeRoleResponse, ResponseMyTeams } from "@/types/team";
import { ResponseExpenses } from "@/types/expense";
import { Member, ResponseTeamMembers } from "@/types/member";
import { AxiosResponse } from "axios";

export const getMyTeams = (): Promise<AxiosResponse<ResponseMyTeams>> => {
    return api.get<ResponseMyTeams>("api/teams/my");
}

export const getTeamMembers = (teamId: string): Promise<AxiosResponse<ResponseTeamMembers>> => {
    return api.get<ResponseTeamMembers>(`api/teams/${teamId}/members`);
}

export const getExpenses = (teamId: string): Promise<AxiosResponse<ResponseExpenses>> => {
    return api.get<ResponseExpenses>(`api/teams/${teamId}/expenses`);
}

export const acceptInvite = (memberId: number): Promise<AxiosResponse<AcceptInviteResponse>> => {
  return api.post<AcceptInviteResponse>(`/api/members/${memberId}/accept`);
}

export const rejectInvite = (memberId: number): Promise<AxiosResponse<RejectInviteResponse>> => {
  return api.post<RejectInviteResponse>(`/api/members/${memberId}/reject`);
}

export const inviteMember = (teamId: string, email: string): Promise<AxiosResponse<InviteMemberResponse>> => {
  return api.post<InviteMemberResponse>(`/api/teams/${teamId}/invite`, { email });
}

export const transferAdmin = (teamId: string, newMemberId: number): Promise<AxiosResponse<TransferAdminResponse>> => {
  return api.patch<TransferAdminResponse>(`/api/teams/${teamId}/transfer-admin`, { newMemberId });
}

export const removeMember = (memberId: number): Promise<AxiosResponse<RemoveMemberResponse>> => {
  return api.delete<RemoveMemberResponse>(`/api/members/${memberId}`);
}

export const changeRole = (memberId: number, role: 'ACCOUNTANT' | 'MEMBER'): Promise<AxiosResponse<ChangeRoleResponse>> => {
  return api.patch<ChangeRoleResponse>(`/api/members/${memberId}/role`, { role });
}