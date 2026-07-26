import Link from "next/link";
import ProgressBar from "@/shared/components/progressbar/ProgressBar";
import MainBarChart from "@/shared/layouts/components/dashboard/MainBarChart";
import CategoryDonutChart from "@/shared/layouts/components/dashboard/CategoryDonutChart";
import { Card } from "@/shared/components/card/Card";
import Image from "next/image";
import ContentTitle from "@/shared/components/contentTitle/ContentTitle";
import { useRouter } from "next/router";

const requestItems = [
  {
    id: 1,
    title: "해커톤 참가비",
    level: "주의",
    memberName: "이서연",
    expense: 300000,
  },
  {
    id: 2,
    title: "외부 강사 강연료",
    level: "높음",
    memberName: "박지호",
    expense: 500000,
  },
];

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

    const totalBudget = 5000000;
    const usedBudget = 2293000;
    const pendingBudget = 800000;
    const remainBudget = totalBudget - (usedBudget + pendingBudget);

    const requestCount = requestItems.length;

    const router = useRouter();
    const { teamId } = router.query;

  return (
    <>
        <ContentTitle title="대시보드" subTitle={`2025년 1월`} href={`/expenses/new`} btnText="지출 요청" />

          <Card title="이번 달 예산" headerRight={`총 ${totalBudget.toLocaleString()}원`}>
            <div className="budget-progress-section">
                <div className="progress-content">
                    <p>{`${usedBudget.toLocaleString()}원`}</p>
                    <span>사용됨</span>
                </div>
                <div className="progress-bar">
                    <ProgressBar total={totalBudget} used={usedBudget} />
                </div>
            </div>

            <div className="budget-status-section">
                <div className="budget-status used-budget">
                    <span>사용됨</span>
                    <p>{`${usedBudget.toLocaleString()}원`}</p>
                </div>

                <div className="budget-status pending-budget">
                    <span>대기 중</span>
                    <p>{`${pendingBudget.toLocaleString()}원`}</p>
                </div>

                <div className="budget-status remain-budget">
                    <span>남은 예산</span>
                    <p>{`${remainBudget.toLocaleString()}원`}</p>
                </div>
            </div>
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

        <Card title="승인이 필요해요" count={`${requestCount}`} href={`/teams/${teamId}/expenses`} linkText="전체보기">
            <div className="request-list-items">
                {requestItems.map((request) => (
                    <Link
                        key={request.id}
                        href={`/expenses/${request.id}`}
                        className="request-item"
                    >
                        <span className="request-item-icon">
                            <Image src="/sidebar/expenses-active.svg" alt="" width={18} height={18} />
                        </span>

                        <div className="request-item-content">
                            <div className="request-item-title">
                                <p className="title">{request.title}</p>
                                <span className={`${request.level === '높음' ? 'danger' : ''}`}>{request.level}</span>
                            </div>

                            <div className="request-item-detail">
                                {`${request.memberName} · ${request.expense.toLocaleString()}원`}
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