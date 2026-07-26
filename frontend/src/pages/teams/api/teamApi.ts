import api from "@/shared/api/api";
import { AcceptInviteResponse, RejectInviteResponse, ResponseMyTeams } from "@/types/team";
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