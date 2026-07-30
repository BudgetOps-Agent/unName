import styles from './aireviewcard.module.css';
import { Card } from '@/shared/components/card/Card';
import { Badge } from '@/shared/components/badge/Badge';

type ReviewVerdict = 'PASS' | 'FAIL' | 'HOLD';

interface Reviewer {
    id: number;
    icon: string;
    verdict: ReviewVerdict;
    opinion: string;
    reason: string;
}

interface AIReviewCardProps {
    reviewers: Reviewer[];
    finalVerdict: string;
    processor: string;
    category: string;
}

const VERDICT_LABEL: Record<ReviewVerdict, string> = {
    PASS: '적합',
    FAIL: '부적합',
    HOLD: '보류',
};

const VERDICT_BADGE_STYLE: Record<ReviewVerdict, 'green' | 'red' | 'yellow'> = {
    PASS: 'green',
    FAIL: 'red',
    HOLD: 'yellow',
};

const REVIEWER_NAMES = ['회칙 심사관', '예산 심사관', '이상탐지 심사관'];

const AIReviewCard = ({ reviewers, finalVerdict, processor, category }: AIReviewCardProps) => {
    return (
        <Card className={styles.reviewCard}>
            <div className={styles.header}>
                <span className={styles.headerIcon}>✨</span>
                <p className={styles.title}>AI 심사 결과</p>
                <Badge text="AI 자동처리" style="purple" />
            </div>
            <p className={styles.subTitle}>심사관별 소견 및 판정 근거예요</p>

            <div className={styles.reviewerList}>
                {reviewers.map((reviewer, index) => (
                    <div key={reviewer.id} className={styles.reviewerBox}>
                        <div className={styles.reviewerHeader}>
                            <span className={styles.reviewerName}>
                                <span className={styles.reviewerIcon}>{reviewer.icon}</span>
                                {REVIEWER_NAMES[index]}
                            </span>
                            <Badge
                                text={`✓ ${VERDICT_LABEL[reviewer.verdict]}`}
                                style={VERDICT_BADGE_STYLE[reviewer.verdict]}
                            />
                        </div>

                        <p className={styles.opinion}>{reviewer.opinion}</p>

                        <p className={styles.reason}>{`판정 근거 · ${reviewer.reason}`}</p>
                    </div>
                ))}
            </div>

            <div className={styles.summaryRow}>
                <div className={styles.summaryBox}>
                    <span className={styles.summaryLabel}>AI 최종 판정</span>
                    <p className={`${styles.summaryValue} ${styles.green}`}>{finalVerdict}</p>
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
