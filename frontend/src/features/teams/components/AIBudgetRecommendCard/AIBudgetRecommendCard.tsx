import styles from './aibudgetrecommendcard.module.css';
import CategoryDonutChart from '@/features/teams/components/CategoryDonutChart/CategoryDonutChart';
import { Badge } from '@/shared/components/badge/Badge';
import Button from '@/shared/components/button/Button';
import useBudgetInsights from '@/features/teams/hooks/useBudgetInsights';
import useCategoryStats from '@/features/teams/hooks/useCategoryStats';
import { CATEGORY_LABEL } from '@/features/teams/constants/category';

interface AIBudgetRecommendCardProps {
    teamId: string | undefined;
}

const AIBudgetRecommendCard = ({ teamId }: AIBudgetRecommendCardProps) => {
    const { insights, isLoading, error, refetch } = useBudgetInsights(teamId);
    const { statistics, isLoading: isStatsLoading, error: statsError, refetch: refetchStats } = useCategoryStats(teamId);

    const donutData = statistics.map((stat) => ({
        name: CATEGORY_LABEL[stat.category] ?? stat.category,
        value: stat.amount,
    }));

    return (
        <div className={styles.container}>
            <div className={styles.titleRow}>
                <div>
                    <p className={styles.title}>AI 추천 예산 관리</p>
                    <p className={styles.subTitle}>AI가 지출 및 예산 현황을 분석하여 예산 관리를 추천해줘요.</p>
                </div>
                {insights?.verified === false && (
                    <Badge text="확인 필요" style="orange" size="sm" />
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.chart}>
                    {isStatsLoading ? (
                        <p className={styles.placeholder}>불러오는 중이에요...</p>
                    ) : statsError ? (
                        <div className={styles.errorBox}>
                            <p className={styles.errorText}>{statsError}</p>
                            <Button className={styles.errorBtn} text="다시 시도" onClick={() => refetchStats()} style="tertiary" />
                        </div>
                    ) : donutData.length === 0 ? (
                        <p className={styles.placeholder}>이번 달 승인된 지출이 없어요</p>
                    ) : (
                        <CategoryDonutChart data={donutData} variant="bottomLegend" />
                    )}
                </div>

                <div className={styles.analysisList}>
                    {isLoading ? (
                        <p className={styles.placeholder}>불러오는 중이에요...</p>
                    ) : error ? (
                        <div className={styles.errorBox}>
                            <p className={styles.errorText}>{error}</p>
                            <Button className={styles.errorBtn} text="다시 시도" onClick={() => refetch()} style="tertiary" />
                        </div>
                    ) : (
                        <>
                            <div className={styles.analysisItem}>
                                <p className={styles.analysisTitle}>카테고리별 분석</p>
                                <p className={styles.analysisText}>
                                    {insights?.categoryAnalysis ?? '분석 결과가 아직 없어요.'}
                                </p>
                            </div>

                            <div className={styles.analysisItem}>
                                <p className={styles.analysisTitle}>예산 현황 분석</p>
                                <p className={styles.analysisText}>
                                    {insights?.budgetStatusAnalysis ?? '분석 결과가 아직 없어요.'}
                                </p>
                            </div>

                            <div className={styles.analysisItem}>
                                <p className={styles.analysisTitle}>AI 추천</p>
                                <p className={styles.analysisText}>
                                    {insights?.recommendation ?? '추천 결과가 아직 없어요.'}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIBudgetRecommendCard;
