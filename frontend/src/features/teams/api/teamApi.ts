import api from "@/shared/api/api";
import { AcceptInviteResponse, RejectInviteResponse, InviteMemberResponse, TransferAdminResponse, RemoveMemberResponse, ChangeRoleResponse, ResponseMyTeams, CreateTeamRequest, CreateTeamResponse, UpdateTeamSettingsRequest, UpdateTeamSettingsResponse } from "@/types/team";
import { ResponseExpenses, ExpenseCreateResponse, ExpenseDetailResponse, ExpenseApproveResponse, ExpenseRejectResponse } from "@/types/expense";
import { Member, ResponseTeamMembers } from "@/types/member";
import { DashboardResponse, MonthlyStatsResponse } from "@/types/dashboard";
import { BudgetResponse } from "@/types/budget";
import { PolicyCreateResponse, PolicyRecommendResponse } from "@/types/policy";
import { AxiosResponse } from "axios";

export const createTeam = (data: CreateTeamRequest): Promise<AxiosResponse<CreateTeamResponse>> => {
  return api.post<CreateTeamResponse>('/api/teams', data);
}

export const updateTeamSettings = (teamId: string, data: UpdateTeamSettingsRequest): Promise<AxiosResponse<UpdateTeamSettingsResponse>> => {
  return api.patch<UpdateTeamSettingsResponse>(`/api/teams/${teamId}/settings`, data);
}

export const createPolicy = (teamId: string, formData: FormData): Promise<AxiosResponse<PolicyCreateResponse>> => {
  return api.post<PolicyCreateResponse>(`/api/teams/${teamId}/policies`, formData, {
    headers: { 'Content-Type': undefined },
  });
}

export const recommendPolicy = (teamId: number): Promise<AxiosResponse<PolicyRecommendResponse>> => {
  return api.post<PolicyRecommendResponse>('/api/policies/recommend', { teamId });
}

export const getMyTeams = (): Promise<AxiosResponse<ResponseMyTeams>> => {
    return api.get<ResponseMyTeams>("api/teams/my");
}

export const getTeamMembers = (teamId: string): Promise<AxiosResponse<ResponseTeamMembers>> => {
    return api.get<ResponseTeamMembers>(`api/teams/${teamId}/members`);
}

export const getExpenses = (teamId: string, status?: "ALL" | "SUBMITTED" | "APPROVED" | "REJECTED"): Promise<AxiosResponse<ResponseExpenses>> => {
  return api.get<ResponseExpenses>(`api/teams/${teamId}/expenses`, {
    params: status && status !== "ALL" ? { status } : undefined,
  });
};

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

export const createExpense = (teamId: string, formData: FormData): Promise<AxiosResponse<ExpenseCreateResponse>> => {
  return api.post<ExpenseCreateResponse>(`/api/teams/${teamId}/expenses`, formData, {
    headers: { 'Content-Type': undefined },
  });
}

export const getExpenseDetail = (expenseId: string): Promise<AxiosResponse<ExpenseDetailResponse>> => {
  return api.get<ExpenseDetailResponse>(`/api/expenses/${expenseId}`);
}

export const getDashboard = (teamId: string): Promise<AxiosResponse<DashboardResponse>> => {
  return api.get<DashboardResponse>(`/api/teams/${teamId}/dashboard`);
}

export const getMonthlyStats = (teamId: string, months?: number): Promise<AxiosResponse<MonthlyStatsResponse>> => {
  return api.get<MonthlyStatsResponse>(`/api/teams/${teamId}/statistics/monthly`, {
    params: months ? { months } : undefined,
  });
}

export const getBudget = (teamId: string): Promise<AxiosResponse<BudgetResponse>> => {
  return api.get<BudgetResponse>(`/api/teams/${teamId}/budget`);
}

export const updateBudget = (teamId: string, totalBudget: number): Promise<AxiosResponse<BudgetResponse>> => {
  return api.patch<BudgetResponse>(`/api/teams/${teamId}/budget`, { totalBudget });
}

export const approveExpense = (expenseId: string): Promise<AxiosResponse<ExpenseApproveResponse>> => {
  return api.post<ExpenseApproveResponse>(`/api/expenses/${expenseId}/approve`);
}

export const rejectExpense = (expenseId: string, rejectReason: string): Promise<AxiosResponse<ExpenseRejectResponse>> => {
  return api.post<ExpenseRejectResponse>(`/api/expenses/${expenseId}/reject`, { rejectReason });
}