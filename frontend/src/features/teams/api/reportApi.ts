import api from "@/shared/api/api";
import { Report, ResponseReport, ReportSummary, ResponseReportSummary } from "@/types/report";

export const getReport = async (teamId: number, page: number = 0, size: number = 10): Promise<Report> => {
    const { data } = await api.get<ResponseReport>(`/api/teams/${teamId}/statistics/report`, {
        params: { page, size },
    });

    return data;
};

export const getReportSummary = async (teamId: number): Promise<ReportSummary> => {
  const { data } = await api.get<ResponseReportSummary>(`/api/teams/${teamId}/statistics/summary`);

  return data;
};

export const downloadReportCsv = async (teamId: number) => {
    const response = await api.get(
        `/api/teams/${teamId}/statistics/report/csv`,
        {
            responseType: 'blob',
        }
    );

    return response.data;
};