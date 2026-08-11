import { Card } from "@/shared/components/card/Card";
import { Badge } from "@/shared/components/badge/Badge";
import Button from "@/shared/components/button/Button";
import LoadingText from "@/shared/components/loading/LoadingText";
import styles from "./AISummaryCard.module.css";

interface AISummaryCardProps {
    summary: string | null;
    verified: boolean | null;
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
}

const AISummaryCard = ({ summary, verified, isLoading, error, onRetry }: AISummaryCardProps) => {
    return (
        <Card
            title="AI 요약"
            headerRight={verified === false && <Badge text="확인 필요" style="orange" size="sm" />}
        >
            {isLoading ? (
                <LoadingText />
            ) : error ? (
                <div className={styles.summaryError}>
                    <p className={styles.summaryErrorText}>{error}</p>
                    <Button text="다시 시도" onClick={onRetry} style="tertiary" />
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
                <p className={styles.summaryText}>이번 달 요약을 아직 준비하지 못했어요.</p>
            )}
        </Card>
    );
};

export default AISummaryCard;
