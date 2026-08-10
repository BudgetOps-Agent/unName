import api from "@/shared/api/api";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/types/auth";
import { Report, ResponseReport, ReportSummary, ResponseReportSummary } from "@/types/report";

export const getReport = async (teamId: number, page: number = 0, size: number = 10): Promise<Report> => {
    try {
        const { data } = await api.get<ResponseReport>(`/api/teams/${teamId}/statistics/report`, {
            params: { page, size },
        });

        return data;
    } catch (err) {
        // 백엔드가 승인된 지출이 없을 때 빈 목록 대신 404(EXPENSE_NOT_FOUND)를 던짐
        // 이 경우만 "데이터 없음"으로 처리하고, 나머지 오류는 그대로 에러로 전달
        const axiosError = err as AxiosError<ErrorResponse>;

        if (axiosError.response?.data?.code === 'EXPENSE_NOT_FOUND') {
            return { page, size, totalElements: 0, totalPages: 0, expenses: [] };
        }

        throw err;
    }
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