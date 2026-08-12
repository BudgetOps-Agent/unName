import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { getExpenses } from "../api/teamApi";
import { ResponseExpenses } from "@/types/expense";
import { ErrorResponse } from "@/types/auth";

type ExpenseStatus =
  | "ALL"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED";

export type ExpenseCounts = ResponseExpenses["counts"];

export const useExpenses = (teamId: string | undefined, status: ExpenseStatus) => {
  return useQuery<ResponseExpenses,AxiosError<ErrorResponse>>({
    queryKey: ["expenses", teamId, status],
    enabled: !!teamId,
    queryFn: async () => {
      const response = await getExpenses(teamId!, status);
      return response.data;
    },
  });
};