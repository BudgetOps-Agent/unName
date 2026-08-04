import { useState, useMemo } from "react";
import { useRouter } from "next/router";

import styles from "./expenses.module.css";

import { Card } from "@/shared/components/card/Card";
import Button from "@/shared/components/button/Button";
import ContentTitle from "@/shared/components/contentTitle/ContentTitle";

import SearchBar from "@/features/teams/components/SearchBar/SearchBar";
import ExpenseList from "@/features/teams/components/ExpenseList/ExpenseList";

import { ExpenseCounts } from "@/features/teams/hooks/useExpenses";
import { useExpenses } from "@/features/teams/hooks/useExpenses";

const filterBtn = [
  { id: 1, text: "전체", value: "ALL" },
  { id: 2, text: "대기", value: "SUBMITTED" },
  { id: 3, text: "승인", value: "APPROVED" },
  { id: 4, text: "반려", value: "REJECTED" },
] as const;

const COUNT_KEY = {
  전체: "all",
  대기: "pending",
  승인: "approved",
  반려: "rejected",
} as const;

type ExpenseFilter =
  | "ALL"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED";

const Expenses = () => {
  const router = useRouter();

  const { teamId } = router.query;
  const validTeamId =
    typeof teamId === "string" ? teamId : undefined;

  const [searchKeyword, setSearchKeyword] = useState("");
  const currentFilter = (router.query.status as ExpenseFilter) ?? "ALL";

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useExpenses(validTeamId, currentFilter);

  const expenses = data?.expenses ?? [];

  const counts = data?.counts ?? {
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  const filteredExpenses = useMemo(() => {
    const keyword = searchKeyword.toLowerCase();

    return expenses.filter(
      (expense) =>
        expense.title.toLowerCase().includes(keyword) ||
        expense.requesterName
          .toLowerCase()
          .includes(keyword)
    );
  }, [expenses, searchKeyword]);

  return (
    <>
      <ContentTitle
        title="지출 내역"
        subTitle={`총 ${counts.all}건이에요`}
        href={`/teams/${validTeamId}/expenses/new`}
        btnText="지출 요청"
      />

      {error ? (
        <Card className={styles.errorCard}>
          <div className={styles.errorContainer}>
            <p className={styles.errorTextTitle}>
              ⚠️ 지출 내역을 불러오지 못했습니다
            </p>

            <p className={styles.errorTextSub}>
              {error.message}
            </p>

            <Button
              className={styles.errorBtn}
              text="다시 시도"
              style="tertiary"
              onClick={() => refetch()}
            />
          </div>
        </Card>
      ) : (
        <>
          <SearchBar
            value={searchKeyword}
            onChange={setSearchKeyword}
          />

          <div className={styles.filterWrapper}>
            <ul className={styles.filterSection}>
              {filterBtn.map((item) => {
                const isActive =
                  currentFilter === item.value;

                return (
                  <li key={item.id}>
                    <button
                      className={`${styles.filterBtn} ${isActive ? styles.active : ""
                        }`}
                      onClick={() =>
                        router.push(
                          {
                            pathname: router.pathname,
                            query: {
                              teamId: validTeamId,
                              ...(item.value !== "ALL" && {
                                status: item.value,
                              }),
                            },
                          },
                          undefined,
                          { shallow: true }
                        )
                      }
                    >
                      <span
                        className={styles.filterBtnText}
                      >
                        <p className={styles.btnTitle}>
                          {item.text}
                        </p>

                        <p className={styles.btnCount}>
                          {
                            counts[
                            COUNT_KEY[item.text]
                            ]
                          }
                        </p>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {isLoading ? (
            <p className={styles.empty}>
              불러오는 중이에요...
            </p>
          ) : filteredExpenses.length === 0 ? (
            <p className={styles.empty}>
              표시할 지출 내역이 없어요.
            </p>
          ) : (
            <ExpenseList
              expenses={filteredExpenses}
            />
          )}
        </>
      )}
    </>
  );
};

export default Expenses;