import { useQuery } from "@tanstack/react-query";
import { getReport } from "../api/reportApi";

export const useReport = (teamId: number) => {
  const query = useQuery({
    queryKey: ["report", teamId],
    queryFn: () => getReport(teamId),
    enabled: !!teamId,
  });

  console.log(query.status, {
    isPending: query.isPending,
    isLoading: query.isLoading,
    isError: query.isError,
    teamId,
  });

  return query;
};