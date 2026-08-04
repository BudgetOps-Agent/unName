import api from "@/shared/api/api";
import { Report, ResponseReport, ReportSummary, ResponseReportSummary } from "@/types/report";

export const getReport = async (teamId: number): Promise<Report> => {
  const { data } = await api.get<ResponseReport>(`/api/teams/${teamId}/statistics/report`);

  return data;
};

export const getReportSummary = async (teamId: number): Promise<ReportSummary> => {
  const { data } = await api.get<ResponseReportSummary>(`/api/teams/${teamId}/statistics/summary`);

  return data;
};