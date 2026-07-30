import SummaryCard from '@/features/teams/components/SummaryCard/SummaryCard';
import styles from './report.module.css';
import Button from '@/shared/components/button/Button';
import ContentTitle from '@/shared/components/contentTitle/ContentTitle';
import ExpenseDetailTable from '@/features/teams/components/ExpenseDetailTable/ExpenseDetailTable';
import { useReport } from '@/features/teams/hooks/useReport';
import { useRouter } from 'next/router';
import Skeleton from '@/shared/components/skeleton/Skeleton';

const Report = () => {
    const router = useRouter();
    const teamId = Number(router.query.teamId);
    const {data, isLoading, isPending, isError, error } = useReport(teamId);
    
  console.log("isReady:", router.isReady);
  console.log("teamId:", teamId);
  console.log({
    isLoading,
    isPending,
    isError,
  });
    return (
        <>
            <ContentTitle title="정산 리포트" subTitle="승인된 지출만 포함돼요">
                <Button
                    className={styles.downloadBtn}
                    text='PDF'
                    iconLeft={<img src="/download.svg" alt="다운로드" />}
                    style='secondary'
                />
                <Button
                    className={styles.downloadBtn}
                    text='CSV'
                    iconLeft={<img src="/download.svg" alt="다운로드" />}
                    style='secondary'
                />
            </ContentTitle>

            <div className={styles.summarySection}>
              
                <SummaryCard title='총 지출' content='343,000원' description='4건 승인됨' style='blue' />
                <SummaryCard title='예산 사용률' content='0%' description='총 3,424원' style='orange' />
                <SummaryCard title='남은 예산' content='3,424원' description='이번 달 기준' style='green' />
            </div>

        <ExpenseDetailTable expenses={data?.expenses ?? []} isLoading={isPending} isError={isError} />
        </>
    )
}

export default Report