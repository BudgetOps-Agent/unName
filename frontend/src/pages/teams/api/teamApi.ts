import api from "@/shared/api/api";
import { ResponseMyTeams } from "@/types/team";
import { AxiosResponse } from "axios";

export const getMyTeams = (): Promise<AxiosResponse<ResponseMyTeams>> => {
    return api.get<ResponseMyTeams>("api/team/my");
}