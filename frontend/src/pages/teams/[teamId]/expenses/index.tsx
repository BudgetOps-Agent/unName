import { useState, useMemo } from "react";
import { useRouter } from "next/router";

import styles from "./expenses.module.css";

import { Card } from "@/shared/components/card/Card";
import Button from "@/shared/components/button/Button";
import ContentTitle from "@/shared/components/contentTitle/ContentTitle";

import SearchBar from "@/features/teams/components/SearchBar/SearchBar";
import ExpenseList from "@/features/teams/components/ExpenseList/ExpenseList";
import LoadingText from "@/shared/components/loading/LoadingText";

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

// 처리 주체 필터 — 승인/반려일 때만 노출. 선택 안 하면 전체라 별도 '전체' 버튼은 없고,
// 이미 선택된 버튼을 다시 누르면 해제된다. 백엔드가 status만 받아서 프론트에서 거름
const processorFilterBtn = [
  { id: 1, text: "AI", value: "AI" },
  { id: 2, text: "관리자·총무", value: "HUMAN" },
] as const;

type ProcessorFilter = "AI" | "HUMAN";

const Expenses = () => {
  const router = useRouter();

  const { teamId } = router.query;
  const validTeamId =
    typeof teamId === "string" ? teamId : undefined;

  const [searchKeyword, setSearchKeyword] = useState("");
  const currentFilter = (router.query.status as ExpenseFilter) ?? "ALL";

  // 처리 주체는 승인/반려에서만 의미가 있음 (대기 건은 아직 처리 주체가 없음)
  const canFilterByProcessor =
    currentFilter === "APPROVED" || currentFilter === "REJECTED";

  const currentProcessorFilter = canFilterByProcessor
    ? (router.query.processedBy as ProcessorFilter | undefined)
    : undefined;

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

    return expenses.filter((expense) => {
      const matchesKeyword =
        expense.title.toLowerCase().includes(keyword) ||
        expense.requesterName
          .toLowerCase()
          .includes(keyword);

      const matchesProcessor =
        !currentProcessorFilter ||
        expense.processedBy === currentProcessorFilter;

      return matchesKeyword && matchesProcessor;
    });
  }, [expenses, searchKeyword, currentProcessorFilter]);

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
              {/* error.message는 "Request failed with status code 500" 같은 원본 문자열이라
                  백엔드가 준 한글 메시지를 우선 쓰고, 없으면 일반 안내로 대체 */}
              {error.response?.data?.message ?? '잠시 후 다시 시도해 주세요.'}
            </p>

            <Button
              text="다시 시도"
              style="tertiary"
              size="md"
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
                              // 상태를 바꾸면 처리 주체 선택은 초기화
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
              {canFilterByProcessor &&
                processorFilterBtn.map((item, index) => {
                  const isActive =
                    currentProcessorFilter === item.value;

                  return (
                    <li
                      key={`processor-${item.id}`}
                      className={index === 0 ? styles.processorGroupStart : undefined}
                    >
                      <button
                        className={`${styles.filterBtn} ${styles.processorBtn} ${isActive ? styles.active : ""
                          }`}
                        onClick={() =>
                          router.push(
                            {
                              pathname: router.pathname,
                              query: {
                                teamId: validTeamId,
                                status: currentFilter,
                                // 이미 선택된 버튼을 다시 누르면 해제 (= 전체)
                                ...(!isActive && {
                                  processedBy: item.value,
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
                        </span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>

          {isLoading ? (
            <LoadingText />
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