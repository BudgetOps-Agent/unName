import { ChangeEvent } from 'react';
import styles from './approvalpolicystep.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';

export interface ApprovalPolicyValue {
    autoApprove: boolean;
    escalationThreshold: number;
}

interface ApprovalPolicyStepProps {
    alwaysReviewManually: boolean;
    setAlwaysReviewManually: (value: boolean) => void;
    threshold: string;
    setThreshold: (value: string) => void;
    onPrev: () => void;
    onNext: (value: ApprovalPolicyValue) => void;
}

const ApprovalPolicyStep = ({
    alwaysReviewManually,
    setAlwaysReviewManually,
    threshold,
    setThreshold,
    onPrev,
    onNext,
}: ApprovalPolicyStepProps) => {
    const handleThresholdChange = (e: ChangeEvent<HTMLInputElement>) => {
        setThreshold(e.target.value.replace(/[^0-9]/g, ''));
    };

    const MIN_THRESHOLD = 50000;
    const thresholdNumber = Number(threshold) || 0;
    const isThresholdValid = thresholdNumber >= MIN_THRESHOLD;
    const isFormValid = alwaysReviewManually || isThresholdValid;

    const handleNext = () => {
        onNext({
            autoApprove: !alwaysReviewManually,
            escalationThreshold: thresholdNumber,
        });
    };

    const thresholdLabel = `${(isThresholdValid ? thresholdNumber : MIN_THRESHOLD).toLocaleString()}원`;

    return (
        <Card className={styles.stepCard}>
            <p className={styles.title}>얼마부터 직접 확인하시겠어요?</p>
            <p className={styles.subTitle}>
                이 금액부터는 AI가 판단하지 않고 관리자에게 직접 가요.
            </p>
            <p className={styles.description}>
                여기서 설정한 값은 정책 관리 화면에서 언제든 바꿀 수 있어요
            </p>

            <div className={`${styles.collapsible} ${alwaysReviewManually ? styles.collapsed : ''}`}>
                <div className={styles.collapsibleInner}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>관리자 승인 필수 금액</label>
                        <div className={styles.thresholdInputWrap}>
                            <input
                                className={styles.thresholdInput}
                                placeholder="50,000"
                                inputMode="numeric"
                                value={threshold}
                                disabled={alwaysReviewManually}
                                onChange={handleThresholdChange}
                            />
                            <span className={styles.thresholdUnit}>원 이상</span>
                        </div>

                        {threshold !== '' && (
                            isThresholdValid ? (
                                <p className={styles.thresholdPreview}>{`${thresholdNumber.toLocaleString()}원`}</p>
                            ) : (
                                <p className={styles.thresholdErrorText}>최소 금액은 50,000원이에요</p>
                            )
                        )}
                    </div>

                    <table className={styles.policyTable}>
                        <thead>
                            <tr>
                                <th>지출 금액</th>
                                <th>AI 심사 결과</th>
                                <th>관리자 승인</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className={styles.rowTitle}>{`${thresholdLabel} 미만`}</td>
                                <td className={styles.approved}>자동 승인/검토 요청</td>
                                <td className={styles.dash}>요청 시</td>
                            </tr>
                            <tr>
                                <td className={styles.rowTitle}>{`${thresholdLabel} 이상`}</td>
                                <td className={styles.dash}>검토 요청</td>
                                <td className={styles.required}>항상</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={styles.toggleRow}>
                <div>
                    <p className={styles.toggleTitle}>모든 지출을 직접 확인할래요</p>
                    <p className={styles.toggleDesc}>AI는 심사는 하되, 최종 결정은 항상 관리자가 해요</p>
                </div>
                <label className={styles.switch}>
                    <input
                        type="checkbox"
                        checked={alwaysReviewManually}
                        onChange={(e) => setAlwaysReviewManually(e.target.checked)}
                    />
                    <span className={styles.slider} />
                </label>
            </div>

            <div className={styles.buttonSection}>
                <Button className={styles.prevBtn} text="이전" style="secondary" size="lg" onClick={onPrev} />
                <Button className={styles.nextBtn} text="다음" style="tertiary" size="lg" onClick={handleNext} disabled={!isFormValid} />
            </div>
        </Card>
    );
};

export default ApprovalPolicyStep;
