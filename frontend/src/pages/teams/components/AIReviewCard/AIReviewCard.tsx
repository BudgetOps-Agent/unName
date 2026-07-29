import styles from './aireviewcard.module.css';
import { Card } from '@/shared/components/card/Card';
import { Badge } from '@/shared/components/badge/Badge';

type ReviewVerdict = 'PASS' | 'FAIL' | 'HOLD';

interface Reviewer {
    id: number;
    verdict: ReviewVerdict;
    opinion: string;
    reason: string;
}

type ProcessType = 'AUTO' | 'ESCALATED';

type FinalVerdict = 'SUBMITTED' | 'ESCALATED' | 'APPROVED' | 'REJECTED';

interface AIReviewCardProps {
    reviewers: Reviewer[];
    finalVerdict: FinalVerdict;
    processType: ProcessType;
    processor: string;
    category: string;
}

const VERDICT_LABEL: Record<ReviewVerdict, string> = {
    PASS: '적합',
    FAIL: '부적합',
    HOLD: '보류',
};

const VERDICT_BADGE_STYLE: Record<ReviewVerdict, 'green' | 'red' | 'orange'> = {
    PASS: 'green',
    FAIL: 'red',
    HOLD: 'orange',
};

const VERDICT_ICON: Record<ReviewVerdict, string> = {
    PASS: '/pass-icon.svg',
    FAIL: '/fail-icon.svg',
    HOLD: '/hold-icon.svg',
};

const PROCESS_LABEL: Record<ProcessType, string> = {
    AUTO: 'AI 자동처리',
    ESCALATED: '⚠ 에스컬레이션',
};

const PROCESS_BADGE_STYLE: Record<ProcessType, 'purple' | 'orange'> = {
    AUTO: 'purple',
    ESCALATED: 'orange',
};

const FINAL_VERDICT_LABEL: Record<FinalVerdict, string> = {
    SUBMITTED: 'AI 검토중',
    ESCALATED: '에스컬레이션',
    APPROVED: 'AI 승인',
    REJECTED: 'AI 반려',
};

const FINAL_VERDICT_BADGE_STYLE: Record<FinalVerdict, 'blue' | 'orange' | 'green' | 'red'> = {
    SUBMITTED: 'blue',
    ESCALATED: 'orange',
    APPROVED: 'green',
    REJECTED: 'red',
};

const REVIEWER_NAMES = ['회칙 심사관', '예산 심사관', '이상탐지 심사관'];

const AIReviewCard = ({ reviewers, finalVerdict, processType, processor, category }: AIReviewCardProps) => {

    return (
        <Card className={styles.reviewCard}>
            <div className={styles.header}>
                <p className={styles.title}>AI 심사 결과</p>
                <Badge
                    text={PROCESS_LABEL[processType]}
                    style={PROCESS_BADGE_STYLE[processType]}
                    size='sm'
                />
            </div>
            <p className={styles.subTitle}>심사관별 소견 및 판정 근거예요</p>

            {processType === 'ESCALATED' && (
                <div className={styles.escalationNotice}>
                    <p className={styles.escalationTitle}>관리자 직접 확인이 필요해요</p>
                    <p className={styles.escalationText}>AI가 자동 처리를 보류하고 관리자·총무의 검토를 요청했어요. 불일치 항목을 확인 후 직접 승인 또는 반려해 주세요.</p>
                </div>
            )}

            <div className={styles.reviewerList}>
                {reviewers.map((reviewer, index) => (
                    <div key={reviewer.id} className={styles.reviewerBox}>
                        <div className={styles.reviewerHeader}>
                            <span className={styles.reviewerName}>
                                {REVIEWER_NAMES[index]}
                            </span>
                            <Badge
                                icon={<img src={VERDICT_ICON[reviewer.verdict]} alt="" width={12} height={12} />}
                                text={VERDICT_LABEL[reviewer.verdict]}
                                style={VERDICT_BADGE_STYLE[reviewer.verdict]}
                            />
                        </div>

                        <p className={styles.opinion}>{reviewer.opinion}</p>

                        <p className={styles.reason}>
                            <span className={styles.reasonTitle}>판정 근거</span>
                            <span>{` · ${reviewer.reason}`}</span>
                        </p>
                    </div>
                ))}
            </div>

            <div className={styles.summaryRow}>
                <div className={styles.summaryBox}>
                    <span className={styles.summaryLabel}>AI 최종 판정</span>
                    <Badge text={FINAL_VERDICT_LABEL[finalVerdict]} style={FINAL_VERDICT_BADGE_STYLE[finalVerdict]} />
                </div>
                <div className={styles.summaryBox}>
                    <span className={styles.summaryLabel}>처리 주체</span>
                    <p className={styles.summaryValue}>{processor}</p>
                </div>
            </div>

            <div className={styles.categoryBox}>
                <span className={styles.summaryLabel}>자동 분류</span>
                <p className={styles.summaryValue}>{category}</p>
            </div>
        </Card>
    )
}

export default AIReviewCard
