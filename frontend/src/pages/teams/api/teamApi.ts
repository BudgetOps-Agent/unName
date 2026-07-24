import api from "@/shared/api/api";
import { ResponseMyTeams } from "@/types/team";
import { ResponseExpenses } from "@/types/expense";
import { AxiosResponse } from "axios";

export const getMyTeams = (): Promise<AxiosResponse<ResponseMyTeams>> => {
    return api.get<ResponseMyTeams>("api/teams/my");
}

export const getExpenses = (teamId: string): Promise<AxiosResponse<ResponseExpenses>> => {
    return api.get<ResponseExpenses>(`api/teams/${teamId}/expenses`);
}