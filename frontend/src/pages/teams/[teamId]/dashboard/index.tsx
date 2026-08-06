import ProgressBar from "@/shared/components/progressbar/ProgressBar";
import MainBarChart from "@/shared/layouts/components/dashboard/MainBarChart";
import CategoryDonutChart from "@/shared/layouts/components/dashboard/CategoryDonutChart";
import { Card } from "@/shared/components/card/Card";
import ContentTitle from "@/shared/components/contentTitle/ContentTitle";
import Button from "@/shared/components/button/Button";
import { useRouter } from "next/router";
import useDashboard from "@/features/teams/hooks/useDashboard";
import useMonthlyStats from "@/features/teams/hooks/useMonthlyStats";
import PendingApprovalCard from "@/features/teams/components/PendingApprovalCard/PendingApprovalCard";

const formatMonthLabel = (yearMonth: string) => {
  const month = Number(yearMonth.split('-')[1]);
  return Number.isNaN(month) ? yearMonth : `${month}월`;
};

const donutData = [
  { name: 'IT/인프라', value: 228000 },
  { name: '교육', value: 500000 },
  { name: '행사', value: 300000 },
  { name: '회의', value: 45000 },
  { name: '식비', value: 150000 },
  { name: '디자인', value: 70000 },
];

const Dashboard = () => {

    const router = useRouter();
    const { teamId } = router.query;
    const validTeamId = typeof teamId === 'string' ? teamId : undefined;

    const { dashboard, isLoading, error, refetch } = useDashboard(validTeamId);
    const { statistics, isLoading: isStatsLoading, error: statsError, refetch: refetchStats } = useMonthlyStats(validTeamId);

    const barData = statistics.map((item) => ({ month: formatMonthLabel(item.month), amount: item.amount }));

  return (
    <>
        <ContentTitle title="대시보드" subTitle={`2025년 1월`} href={`/expenses/new`} btnText="지출 요청" />

          <Card title="이번 달 예산" headerRight={dashboard ? `총 ${dashboard.totalBudget.toLocaleString()}원` : undefined}>
            {isLoading ? (
                <p>불러오는 중이에요...</p>
            ) : error ? (
                <div className="budget-error">
                    <p>{error}</p>
                    <Button text="다시 시도" onClick={() => refetch()} style="tertiary" />
                </div>
            ) : dashboard && (
                <>
                    <div className="budget-progress-section">
                        <div className="progress-content">
                            <p>{`${dashboard.usedBudget.toLocaleString()}원`}</p>
                            <span>사용됨</span>
                        </div>
                        <div className="progress-bar">
                            <ProgressBar total={dashboard.totalBudget} used={dashboard.usedBudget} />
                        </div>
                    </div>

                    <div className="budget-status-section">
                        <div className="budget-status used-budget">
                            <span>사용됨</span>
                            <p>{`${dashboard.usedBudget.toLocaleString()}원`}</p>
                        </div>

                        <div className="budget-status pending-budget">
                            <span>대기 중</span>
                            <p>{`${dashboard.pendingAmount.toLocaleString()}원`}</p>
                        </div>

                        <div className="budget-status remain-budget">
                            <span>남은 예산</span>
                            <p>{`${dashboard.remainingBudget.toLocaleString()}원`}</p>
                        </div>
                    </div>
                </>
            )}
        </Card>

        <div className="cards">
            <Card title="월별 지출">
                {isStatsLoading ? (
                    <p>불러오는 중이에요...</p>
                ) : statsError ? (
                    <div className="budget-error">
                        <p>{statsError}</p>
                        <Button text="다시 시도" onClick={() => refetchStats()} style="tertiary" />
                    </div>
                ) : barData.length === 0 ? (
                    <p className="chart-empty">지출 내역이 없어요</p>
                ) : (
                    <MainBarChart data={barData} />
                )}
            </Card>

            <Card>
                <div className="card-title">
                    <p className="title">카테고리 분포</p>
                </div>
                <CategoryDonutChart data={donutData} />
            </Card>
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