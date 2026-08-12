import MainBarChart from "@/features/teams/components/MainBarChart/MainBarChart";
import AISummaryCard from "@/features/teams/components/AISummaryCard/AISummaryCard";
import { Card } from "@/shared/components/card/Card";
import ContentTitle from "@/shared/components/contentTitle/ContentTitle";
import Button from "@/shared/components/button/Button";
import { useRouter } from "next/router";
import useDashboard from "@/features/teams/hooks/useDashboard";
import useMonthlyStats from "@/features/teams/hooks/useMonthlyStats";
import useAiSummary from "@/features/teams/hooks/useAiSummary";
import PendingApprovalCard from "@/features/teams/components/PendingApprovalCard/PendingApprovalCard";
import BudgetSummaryCard from "@/features/teams/components/BudgetSummaryCard/BudgetSummaryCard";
import LoadingText from "@/shared/components/loading/LoadingText";
import styles from "./dashboard.module.css";

const formatMonthLabel = (yearMonth: string) => {
  const month = Number(yearMonth.split('-')[1]);
  return Number.isNaN(month) ? yearMonth : `${month}월`;
};

const Dashboard = () => {

    const router = useRouter();
    const { teamId } = router.query;
    const validTeamId = typeof teamId === 'string' ? teamId : undefined;

    const { dashboard, isLoading, error, refetch } = useDashboard(validTeamId);
    const { statistics, isLoading: isStatsLoading, error: statsError, refetch: refetchStats } = useMonthlyStats(validTeamId);
    const { summary, verified, isLoading: isSummaryLoading, error: summaryError, refetch: refetchSummary } = useAiSummary(validTeamId);

    const barData = statistics.map((item) => ({ month: formatMonthLabel(item.month), amount: item.amount }));

    const now = new Date();
    const currentMonthLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

  return (
    <>
        <ContentTitle title="대시보드" subTitle={currentMonthLabel} href={`/teams/${validTeamId}/expenses/new`} btnText="지출 요청" />

        <BudgetSummaryCard dashboard={dashboard} isLoading={isLoading} error={error} refetch={refetch} />

        <div className="cards">
            <Card title="월별 지출">
                {isStatsLoading ? (
                    <LoadingText />
                ) : statsError ? (
                    <div className={styles.chartError}>
                        <p>{statsError}</p>
                        <Button text="다시 시도" onClick={() => refetchStats()} style="tertiary" size="md" />
                    </div>
                ) : barData.length === 0 ? (
                    <p className={styles.chartEmpty}>지출 내역이 없어요</p>
                ) : (
                    <MainBarChart data={barData} />
                )}
            </Card>

            <AISummaryCard
                summary={summary}
                verified={verified}
                isLoading={isSummaryLoading}
                error={summaryError}
                onRetry={refetchSummary}
            />
        </div>

        <PendingApprovalCard
            teamId={validTeamId}
            pendingCount={dashboard?.pendingApprovalCount ?? 0}
            recentExpenses={dashboard?.recentExpenses ?? []}
            isLoading={isLoading}
        />
    </>
  )
}

export default Dashboard 