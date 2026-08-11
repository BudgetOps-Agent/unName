import SummaryCard from '@/features/teams/components/SummaryCard/SummaryCard';
import styles from './report.module.css';
import Button from '@/shared/components/button/Button';
import ContentTitle from '@/shared/components/contentTitle/ContentTitle';
import ExpenseDetailTable from '@/features/teams/components/ExpenseDetailTable/ExpenseDetailTable';
import { useReport } from '@/features/teams/hooks/useReport';
import { useReportSummary } from '@/features/teams/hooks/useReportSummary';
import { useRouter } from 'next/router';
import Skeleton from '@/shared/components/skeleton/Skeleton';
import Pagination from '@/shared/components/pagination/Pagination';
import { useState } from 'react';
import { Card } from '@/shared/components/card/Card';
import { useReportCsv } from '@/features/teams/hooks/useReportCsv';
import useRoleGuard from '@/features/teams/hooks/useRoleGuard';
import LoadingText from '@/shared/components/loading/LoadingText';

const Report = () => {
    const router = useRouter();
    const teamId = Number(router.query.teamId);
    const validTeamId = typeof router.query.teamId === 'string' ? router.query.teamId : undefined;
    const { isChecking: isRoleChecking, isAllowed } = useRoleGuard(validTeamId, ['ADMIN', 'ACCOUNTANT']);
    const {
        data: summary,
        isPending: isSummaryPending,
        isError: isSummaryError,
        refetch: refetchSummary,
    } = useReportSummary(teamId);

    const [page, setPage] = useState(1);
    const [prevTeamId, setPrevTeamId] = useState(teamId);
    const { mutate: downloadCsv, isPending: isDownloading } = useReportCsv();

    if (!Number.isNaN(teamId) && teamId !== prevTeamId) {
        setPrevTeamId(teamId);
        setPage(1);
    }

    const { data, isPending, isError } = useReport(teamId, page - 1);
    const expenses = data?.expenses ?? [];
    const totalPages = data?.totalPages ?? 1;

    if (isRoleChecking || !isAllowed) {
        return <LoadingText />;
    }

    const handleCsvDownload = () => {
        downloadCsv(teamId, {
            onSuccess: (data) => {
                const blob = new Blob([data], {
                    type: 'text/csv;charset=utf-8;',
                });

                const url = window.URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `정산리포트_${teamId}.csv`;

                document.body.appendChild(link);
                link.click();

                link.remove();
                window.URL.revokeObjectURL(url);
            },
            onError: (error) => {
                console.error('CSV 다운로드 실패:', error);
                alert('정산 리포트를 다운로드하지 못했습니다.');
            },
        });
    };

    return (
        <>
            <ContentTitle title="정산 리포트" subTitle="승인된 지출만 포함돼요">
                {/* <Button
                    className={styles.downloadBtn}
                    text='PDF'
                    iconLeft={<img src="/download.svg" alt="다운로드" />}
                    style='secondary'
                /> */}
                <Button
                    className={styles.downloadBtn}
                    text='CSV'
                    iconLeft={<img src="/download.svg" alt="다운로드" />}
                    style='noStyle'
                    onClick={handleCsvDownload}
                />
            </ContentTitle>

            <div className={styles.summarySection}>
                {isSummaryPending ? (
                    <>
                        <Skeleton height={90} radius={24} />
                        <Skeleton height={90} radius={24} />
                        <Skeleton height={90} radius={24} />
                    </>
                ) : isSummaryError ? (
                    <Card className={styles.errorCard}>
                        <div className={styles.errorContainer}>
                            <p className={styles.errorTextTitle}>
                                ⚠️ 정산 내역을 불러오지 못했습니다
                            </p>

                            <Button
                                className={styles.errorBtn}
                                text="다시 시도"
                                style="tertiary"
                                onClick={() => refetchSummary()}
                            />
                        </div>
                    </Card>
                ) : (
                    <>
                        <SummaryCard
                            title="총 지출"
                            content={`${(summary?.totalExpense ?? 0).toLocaleString()}원`}
                            description={`${summary?.approvedCount ?? 0}건 승인됨`}
                            style="blue"
                        />

                        <SummaryCard
                            title="예산 사용률"
                            content={`${summary?.usagePercentage ?? 0}%`}
                            description={`총 ${(summary?.totalBudget ?? 0).toLocaleString()}원`}
                            style="orange"
                        />

                        <SummaryCard
                            title="남은 예산"
                            content={`${(summary?.remainingBudget ?? 0).toLocaleString()}원`}
                            description="이번 달 기준"
                            style="green"
                        />
                    </>
                )}
            </div>

            <ExpenseDetailTable
                expenses={expenses}
                totalAmount={summary?.totalExpense ?? 0}
                isLoading={isPending}
                isError={isError}
            />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
    )
}

export default Report