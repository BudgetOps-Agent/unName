import { useState, ChangeEvent } from 'react';
import styles from './approvalpolicystep.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';

const PRESET_AMOUNTS = [
    { label: '10만원', value: 100000 },
    { label: '20만원', value: 200000 },
    { label: '30만원', value: 300000 },
];

export interface ApprovalPolicyValue {
    autoApprove: boolean;
    escalationThreshold: number;
}

interface ApprovalPolicyStepProps {
    onPrev: () => void;
    onNext: (value: ApprovalPolicyValue) => void;
}

const ApprovalPolicyStep = ({ onPrev, onNext }: ApprovalPolicyStepProps) => {
    const [alwaysReviewManually, setAlwaysReviewManually] = useState(false);
    const [threshold, setThreshold] = useState('200000');

    const handleThresholdChange = (e: ChangeEvent<HTMLInputElement>) => {
        setThreshold(e.target.value.replace(/[^0-9]/g, ''));
    };

    const handleNext = () => {
        onNext({
            autoApprove: !alwaysReviewManually,
            escalationThreshold: Number(threshold) || 0,
        });
    };

    const thresholdLabel = threshold ? `${Number(threshold).toLocaleString()}원` : '0원';

    return (
        <Card className={styles.stepCard}>
            <p className={styles.title}>얼마부터 직접 확인하시겠어요?</p>
            <p className={styles.subTitle}>
                이 금액부터는 AI가 판단하지 않고 관리자에게 직접 가요.
                <br />
                여기서 설정한 값은 에이전트 정책 화면에서 언제든 바꿀 수 있어요
            </p>

            <div className={styles.toggleRow}>
                <div>
                    <p className={styles.toggleTitle}>당연히 모든 지출을 직접 확인할래요</p>
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

            <div className={styles.formGroup}>
                <label className={styles.label}>관리자 확인 설정 금액</label>
                <div className={styles.thresholdInputWrap}>
                    <input
                        className={styles.thresholdInput}
                        inputMode="numeric"
                        value={threshold}
                        disabled={alwaysReviewManually}
                        onChange={handleThresholdChange}
                    />
                    <span className={styles.thresholdUnit}>원 이상</span>
                </div>

                <div className={styles.presetList}>
                    {PRESET_AMOUNTS.map((preset) => (
                        <Button
                            key={preset.value}
                            className={`${styles.presetBtn} ${Number(threshold) === preset.value ? styles.presetBtnActive : ''}`}
                            text={preset.label}
                            style='ghost'
                            disabled={alwaysReviewManually}
                            onClick={() => setThreshold(String(preset.value))}
                        />
                    ))}
                </div>
            </div>

            <table className={styles.policyTable}>
                <thead>
                    <tr>
                        <th>지출 유형</th>
                        <th>AI 심사 후</th>
                        <th>관리자 직접</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <p className={styles.rowTitle}>소액 지출</p>
                            <p className={styles.rowSub}>50,000원 미만</p>
                        </td>
                        <td className={styles.approved}>AI 자동 승인</td>
                        <td className={styles.dash}>—</td>
                    </tr>
                    <tr>
                        <td>
                            <p className={styles.rowTitle}>중간 지출</p>
                            <p className={styles.rowSub}>{`50,000~${thresholdLabel}`}</p>
                        </td>
                        <td className={styles.pending}>대기/자동</td>
                        <td className={styles.dash}>—</td>
                    </tr>
                    <tr>
                        <td>
                            <p className={styles.rowTitle}>고액 지출</p>
                            <p className={styles.rowSub}>{`${thresholdLabel} 이상`}</p>
                        </td>
                        <td className={styles.dash}>—</td>
                        <td className={styles.required}>필수</td>
                    </tr>
                </tbody>
            </table>

            <div className={styles.buttonSection}>
                <Button className={styles.prevBtn} text="이전" style="secondary" size="lg" onClick={onPrev} />
                <Button className={styles.nextBtn} text="다음" style="tertiary" size="lg" onClick={handleNext} />
            </div>
        </Card>
    );
};

export default ApprovalPolicyStep;
