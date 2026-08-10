import { useMutation } from '@tanstack/react-query';
import { downloadReportCsv } from '../api/reportApi';

export const useReportCsv = () => {
    return useMutation({
        mutationFn: (teamId: number) => downloadReportCsv(teamId),
    });
};