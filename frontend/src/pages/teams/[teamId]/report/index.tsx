import styles from './report.module.css';
import Button from '@/shared/components/button/Button';
import SummaryCard from '../../components/SummaryCard/SummaryCard';
import ExpenseDetailTable from '../../components/ExpenseDetailTable/ExpenseDetailTable';
import ContentTitle from '@/shared/components/contentTitle/ContentTitle';

const expenses = [
    { id: 1, item: '정기 회의 다과비', category: '회의', requester: '박지호', date: '2025-01-15', amount: 45000 },
    { id: 2, item: 'AWS 서버 운영비', category: 'IT/인프라', requester: '김민준', date: '2025-01-18', amount: 180000 },
    { id: 3, item: '노션 팀 플랜', category: 'IT/인프라', requester: '김민준', date: '2025-01-10', amount: 48000 },
    { id: 4, item: '포스터 인쇄비', category: '디자인', requester: '정다은', date: '2025-01-08', amount: 70000 },
];

const Report = () => {
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

            <ExpenseDetailTable expenses={expenses} />
        </>
    )
}

export default Report