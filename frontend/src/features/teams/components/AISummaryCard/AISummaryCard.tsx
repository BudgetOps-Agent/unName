import { Card } from "@/shared/components/card/Card";
import Button from "@/shared/components/button/Button";
import LoadingText from "@/shared/components/loading/LoadingText";
import styles from "./AISummaryCard.module.css";

interface AISummaryCardProps {
    summary: string | null;
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
}

const AISummaryCard = ({ summary, isLoading, error, onRetry }: AISummaryCardProps) => {
    return (
        <Card title="AI 요약">
            {isLoading ? (
                <LoadingText text="AI가 이번 달 지출을 분석하고 있어요" />
            ) : error ? (
                <div className={styles.summaryError}>
                    <p className={styles.summaryErrorText}>{error}</p>
                    <Button text="다시 시도" onClick={onRetry} style="tertiary" size="md" />
                </div>
            ) : summary ? (
                <p className={styles.summaryText}>
                    {summary.split('\n').map((line, index) => (
                        <span key={index}>
                            {index > 0 && <br />}
                            {line}
                        </span>
                    ))}
                </p>
            ) : (
                <p className={styles.summaryEmpty}>이번 달 요약을 아직 준비하지 못했어요.</p>
            )}
        </Card>
    );
};

export default AISummaryCard;
