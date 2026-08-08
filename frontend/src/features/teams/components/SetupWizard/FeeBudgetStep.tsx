import { ChangeEvent } from 'react';
import styles from './feebudgetstep.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';

interface FeeBudgetStepProps {
    teamType: string;
    fee: string;
    setFee: (fee: string) => void;
    noFee: boolean;
    setNoFee: (noFee: boolean) => void;
    onNext: (membershipFee: number | null) => void;
    isSubmitting?: boolean;
}

const FeeBudgetStep = ({ teamType, fee, setFee, noFee, setNoFee, onNext, isSubmitting = false }: FeeBudgetStepProps) => {
    const handleFeeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFee(e.target.value.replace(/[^0-9]/g, ''));
    };

    const handleNoFeeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setNoFee(checked);
        if (checked) {
            setFee('');
        }
    };

    const isFormValid = noFee || fee !== '';

    const handleNext = () => {
        onNext(noFee ? null : Number(fee) || 0);
    };

    return (
        <Card className={styles.stepCard}>
            <p className={styles.title}>회비를 설정해요</p>
            <p className={styles.subTitle}>AI가 예산 심사 시 기준으로 활용해요</p>

            <div className={styles.feeHeader}>
                <label className={styles.label}>월 회비 입력</label>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={noFee}
                        onChange={handleNoFeeChange}
                    />
                    없음
                </label>
            </div>

            <div className={styles.feeInputWrap}>
                <input
                    className={styles.feeInput}
                    placeholder="0"
                    inputMode="numeric"
                    value={fee}
                    disabled={noFee}
                    onChange={handleFeeChange}
                />
                <span className={styles.feeUnit}>원</span>
            </div>

            {!noFee && fee && (
                <p className={styles.feePreview}>{`${Number(fee).toLocaleString()}원`}</p>
            )}

            <div className={styles.infoBox}>
                <img src="/point-icon.svg" alt="info" className={styles.infoIcon} />
                <p>{`모임 유형 ${teamType || '○○'}에 맞는 지출 카테고리를 AI가 자동으로 추천해 드려요`}</p>
            </div>

            <Button className={styles.nextBtn} text={isSubmitting ? "저장하는 중..." : "다음"} style="tertiary" size="lg" onClick={handleNext} disabled={!isFormValid || isSubmitting} />
        </Card>
    );
};

export default FeeBudgetStep;
