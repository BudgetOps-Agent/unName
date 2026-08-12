import styles from './receiptcard.module.css';
import { Card } from '@/shared/components/card/Card';

interface ReceiptCardProps {
    receiptUrl: string | null;
}

const ReceiptCard = ({ receiptUrl }: ReceiptCardProps) => {
    return (
        <Card className={styles.receiptCard}>
            <p className={styles.receiptTitle}>영수증</p>

            {receiptUrl ? (
                <div className={styles.receiptPreview}>
                    <img src={receiptUrl} alt="영수증" className={styles.receiptImage} />
                </div>
            ) : (
                <div className={styles.receiptEmpty}>
                    <span className={styles.receiptEmptyIcon}>
                        <img src="/receipt.svg" alt="영수증 없음" />
                    </span>
                    <p className={styles.receiptEmptyText}>첨부된 영수증이 없어요</p>
                </div>
            )}

            {receiptUrl && (
                <a href={receiptUrl} download className={styles.downloadLink}>
                    <img src="/download-blue.svg" alt="다운로드" />
                    파일 내려받기
                </a>
            )}
        </Card>
    )
}

export default ReceiptCard
