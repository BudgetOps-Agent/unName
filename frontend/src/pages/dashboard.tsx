import Link from "next/link";
import ProgressBar from "@/shared/components/progressbar/ProgressBar";

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

const dashboard = () => {

  const totalBudget = 5000000;
  const usedBudget = 2293000;
  const pendingBudget = 800000;
  const remainBudget = totalBudget - (usedBudget + pendingBudget);

  const requestCount = requestItems.length;

  return (
    <div className="dashboard-container">
      <header>
        <div className="title">
          <h1>대시보드</h1>
          <p>2025년 1월</p>
        </div>
        <Link href="/expenses/new" className="expenses-btn">
          <span>+</span>
          <span>지출 요청</span>
        </Link>
      </header>

      <div className="main-section">
        <div className="total-budget-card">
          <div className="total-budget-header">
            <span>이번 달 예산</span>
            <p>{`총 ${totalBudget.toLocaleString()}원`}</p>
          </div>

          <div className="budget-progress-section">
            <div className="progress-content">
              <p>{`${usedBudget.toLocaleString()}원`}</p>
              <span>사용됨</span>
            </div>
            
            <ProgressBar total={totalBudget} used={usedBudget} />
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
        </div>

        <div className="statistics-section">
          <div className="monthly-card">
            <p>월별 지출</p>
          </div>

          <div className="category-card">
            <p>카테고리 분포</p>
          </div>
        </div>

        <div className="request-card">
          <div className="request-list-header">
            <div className="header-left">
              <p>승인이 필요해요</p>
              <span>{requestCount}</span>
            </div>
            
            <div className="header-right">
              <Link href="/expenses">전체 보기</Link>
            </div>
          </div>

          <div className="request-list-items">
            {requestItems.map((request) => (
              <Link 
                key={request.id}
                href={`/expenses/${request.id}`}
                className="request-item"
              >
                <span className="request-item-icon">
                  <img src="/sidebar/expenses-active.svg" alt="" />
                </span>

                <div className="request-item-content">
                  <div className="content-title">
                    <p>{request.title}</p>
                    <span className={`${request.level === '높음' ? 'danger' : ''}`}>{request.level}</span>
                  </div>

                  <div className="content-detail">
                    {`${request.memberName} · ${request.expense.toLocaleString()}원`}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default dashboard