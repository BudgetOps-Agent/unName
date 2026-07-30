import Link from "next/link";
import ProgressBar from "@/shared/components/progressbar/ProgressBar";
import MainBarChart from "@/shared/layouts/components/dashboard/MainBarChart";
import CategoryDonutChart from "@/shared/layouts/components/dashboard/CategoryDonutChart";
import { Card } from "@/shared/components/card/Card";
import Image from "next/image";
import ContentTitle from "@/shared/components/contentTitle/ContentTitle";
import Button from "@/shared/components/button/Button";
import { Badge } from "@/shared/components/badge/Badge";
import { useRouter } from "next/router";
import useDashboard from "@/features/teams/hooks/useDashboard";

type PendingStatus = 'SUBMITTED' | 'ESCALATED';

const STATUS_LABEL: Record<PendingStatus, string> = {
    SUBMITTED: '대기',
    ESCALATED: '⚠ 에스컬',
}

const formatDate = (isoString: string) => {
    if (!isoString) return "";
    return isoString.slice(0, 10);
}

const barData = [
  { name: '9월', amount: 320000 },
  { name: '10월', amount: 580000 },
  { name: '11월', amount: 410000 },
  { name: '12월', amount: 290000 },
  { name: '1월', amount: 743000 },
];

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
                <MainBarChart data={barData} />
            </Card>

            <Card>
                <div className="card-title">
                    <p className="title">카테고리 분포</p>
                </div>
                <CategoryDonutChart data={donutData} />
            </Card>
        </div>

        <Card title="승인이 필요해요" count={`${dashboard?.pendingApprovalCount ?? 0}`} href={`/teams/${teamId}/expenses`} linkText="전체보기">
            <div className="request-list-items">
                {dashboard?.recentExpenses.map((request) => (
                    <Link
                        key={request.id}
                        href={`/teams/${teamId}/expenses/${request.id}`}
                        className="request-item"
                    >
                        <span className="request-item-icon">
                            <Image src="/sidebar/expenses-active.svg" alt="" width={18} height={18} />
                        </span>

                        <div className="request-item-content">
                            <div className="request-item-title">
                                <p className="title">{request.title}</p>
                                <Badge text={STATUS_LABEL.SUBMITTED} style="yellow" />
                                {request.status === 'ESCALATED' && (
                                    <Badge text={STATUS_LABEL.ESCALATED} style="orange" size="sm" />
                                )}
                            </div>

                            <div className="request-item-detail">
                                {`${formatDate(request.date)} · ${request.amount.toLocaleString()}원`}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </Card>
    </>
  )
}

export default Dashboard 