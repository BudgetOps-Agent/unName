import { useState, ChangeEvent } from 'react';
import styles from './feebudgetstep.module.css';
import { Card } from '@/shared/components/card/Card';
import Button from '@/shared/components/button/Button';

interface FeeBudgetStepProps {
    teamType: string;
    onNext: (membershipFee: number | null) => void;
}

const FeeBudgetStep = ({ teamType, onNext }: FeeBudgetStepProps) => {
    const [fee, setFee] = useState('');
    const [noFee, setNoFee] = useState(false);

    const handleFeeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFee(e.target.value.replace(/[^0-9]/g, ''));
    };

    const handleNext = () => {
        onNext(noFee ? null : Number(fee) || 0);
    };

    return (
        <Card className={styles.stepCard}>
            <p className={styles.title}>회비와 예산을 설정해요</p>
            <p className={styles.subTitle}>AI가 예산 심사 시 기준으로 활용해요</p>

            <div className={styles.feeHeader}>
                <label className={styles.label}>회비 금액</label>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={noFee}
                        onChange={(e) => setNoFee(e.target.checked)}
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

            <div className={styles.infoBox}>
                <img src="/info-icon.svg" alt="info" className={styles.infoIcon} />
                <p>{`모임 유형 ${teamType || '○○'}에 맞는 지출 카테고리를 AI가 자동으로 추천해 드려요`}</p>
            </div>

            <Button className={styles.nextBtn} text="다음" style="tertiary" size="lg" onClick={handleNext} />
        </Card>
    );
};

export default FeeBudgetStep;
