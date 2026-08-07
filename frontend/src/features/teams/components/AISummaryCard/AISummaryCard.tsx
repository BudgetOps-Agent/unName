import { Card } from "@/shared/components/card/Card";
import styles from "./AISummaryCard.module.css";

const AISummaryCard = () => {
    return (
        <Card title="AI 요약">
            <p className={styles.summaryText}>
                이번 달 IT/인프라 비용이 전월 대비 23% 늘었어요.
                <br />
                전체 예산 사용률은 양호한 수준이고 잔여 예산도 충분해요
            </p>
        </Card>
    );
};

export default AISummaryCard;
