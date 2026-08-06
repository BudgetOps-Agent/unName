import styles from './aibudgetrecommendcard.module.css';
import CategoryDonutChart from '@/features/teams/components/CategoryDonutChart/CategoryDonutChart';

const donutData = [
    { name: 'IT/인프라', value: 228000 },
    { name: '교육', value: 500000 },
    { name: '행사', value: 300000 },
    { name: '회의', value: 45000 },
    { name: '식비', value: 150000 },
    { name: '디자인', value: 70000 },
];

const AIBudgetRecommendCard = () => {
    return (
        <div className={styles.container}>
            <p className={styles.title}>AI 추천 예산 관리</p>
            <p className={styles.subTitle}>AI가 지출 및 예산 현황을 분석하여 예산 관리를 추천해줘요.</p>

            <div className={styles.content}>
                <div className={styles.chart}>
                    <CategoryDonutChart data={donutData} variant="bottomLegend" />
                </div>

                <div className={styles.analysisList}>
                    <div className={styles.analysisItem}>
                        <p className={styles.analysisTitle}>카테고리별 분석</p>
                        <p className={styles.analysisText}>
                            이번 달 지출을 분석한 결과 IT·인프라(38%)와 교육(24%) 항목의 비중이 가장 높습니다. IT·인프라는 프로젝트 운영에 필요한 핵심 비용으로 적절한 수준이지만, 교육비는 계획 대비 다소 빠르게 사용되고 있습니다. 반면 회의비와 디자인 비용은 예산 대비 여유가 있어 현재 수준을 유지하는 것을 추천드립니다.
                        </p>
                    </div>

                    <div className={styles.analysisItem}>
                        <p className={styles.analysisTitle}>예산 현황 분석</p>
                        <p className={styles.analysisText}>
                            현재 예산 사용률은 <strong>42%</strong>로 계획 대비 안정적인 수준입니다. 현재와 같은 소비 패턴이 유지된다면 월말까지 예산을 초과할 가능성은 낮습니다. 다만 프로젝트 후반에는 행사 및 식비 지출이 증가하는 경향이 있으므로 남은 예산의 약 <strong>15~20%</strong>는 예비비로 확보하는 것이 좋습니다.
                        </p>
                    </div>

                    <div className={styles.analysisItem}>
                        <p className={styles.analysisTitle}>AI 추천</p>
                        <p className={styles.analysisText}>
                            반복적으로 발생하는 소액 지출이 전체 예산의 약 <strong>12%</strong>를 차지하고 있습니다. 불필요한 구독 서비스나 잦은 간식·배달비를 줄이면 이번 달 약 8~10만원의 추가 예산을 확보할 수 있습니다. 절약된 예산은 예기치 않은 운영 비용이나 다음 프로젝트를 위한 예산으로 활용하는 것을 추천드립니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIBudgetRecommendCard;
