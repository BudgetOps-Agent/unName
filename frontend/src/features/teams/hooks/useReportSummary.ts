import { useQuery } from "@tanstack/react-query";
import { getReportSummary } from "../api/reportApi";

export const useReportSummary = (teamId: number) => {
  return useQuery({
    queryKey: ["reportSummary", teamId],
    queryFn: () => getReportSummary(teamId),
    enabled: !!teamId,
  });
};
