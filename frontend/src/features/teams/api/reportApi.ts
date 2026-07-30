import api from "@/shared/api/api";
import { Report, ResponseReport } from "@/types/report";

export const getReport = async (teamId: number): Promise<Report> => {
  const { data } = await api.get<ResponseReport>(`/api/teams/${teamId}/statistics/report`);

  return data.report;
};