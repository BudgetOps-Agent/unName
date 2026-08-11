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

// processType이 ESCALATED면 AI 자체 결론은 항상 "에스컬레이션"(나중에 관리자가 승인/반려해도 AI의 최종 판정은 안 바뀜)
// AUTO일 땐 관리자가 개입할 방법이 없어(대기 화면 버튼은 상태==='대기'일 때만 노출) finalVerdict가 곧 AI의 판정과 동일
const getFinalVerdictBadge = (processType: ProcessType, finalVerdict: FinalVerdict): { label: string; style: 'orange' | 'green' | 'red' } => {
    if (processType === 'ESCALATED') return { label: '에스컬레이션', style: 'orange' };
    return finalVerdict === 'REJECTED'
        ? { label: 'AI 반려', style: 'red' }
        : { label: 'AI 승인', style: 'green' };
};

// 백엔드 응답에 심사관 종류(auditor) 필드가 없어 opinions[] 순서로만 구분됨.
// LLM 내부 처리 순서(evidence→budget→precedent→rule)에 맞춘 값이다.
//
// TODO: 일부 심사관이 빠진 채 오는 경우(예: 증빙 불일치로 나머지를 건너뛴 보류 건)
//       중간이 비면 이 위치 매핑은 다시 어긋난다. 백엔드가 auditor를 내려주면
//       위치가 아닌 auditor 키 기준 매핑으로 바꿔야 함 (LLM팀 요청사항)
const REVIEWER_NAMES = ['증빙 심사관', '예산 심사관', '이상탐지 심사관', '회칙 심사관'];

const AIReviewCard = ({ reviewers, finalVerdict, processType, processor, category }: AIReviewCardProps) => {

    const finalVerdictBadge = getFinalVerdictBadge(processType, finalVerdict);
    // 에스컬레이션 후 아직 관리자·총무가 승인/반려하지 않았으면 처리 주체 미정
    const processorDisplay = finalVerdict === 'ESCALATED' ? '-' : processor;

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
                                {REVIEWER_NAMES[index] ?? `심사관 ${index + 1}`}
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
                    <Badge text={finalVerdictBadge.label} style={finalVerdictBadge.style} />
                </div>
                <div className={styles.summaryBox}>
                    <span className={styles.summaryLabel}>처리 주체</span>
                    <p className={styles.summaryValue}>{processorDisplay}</p>
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
