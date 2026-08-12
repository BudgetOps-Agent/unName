import { useQuery } from "@tanstack/react-query";
import { getReport } from "../api/reportApi";

export const useReport = (teamId: number, page: number = 0) => {
    const query = useQuery({
        queryKey: ["report", teamId, page],
        queryFn: () => getReport(teamId, page),
        enabled: !!teamId,
    });

    return query;
};