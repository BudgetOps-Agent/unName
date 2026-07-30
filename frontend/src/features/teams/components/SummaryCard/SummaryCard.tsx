import styles from './summarycard.module.css';
import { Card } from '@/shared/components/card/Card';

interface SummaryCardProps {
    title: string;
    content: string;
    description: string;
    style?: 'blue' | 'orange' | 'green'
}

const SummaryCard = ({ title, content, description, style }: SummaryCardProps) => {
    return (
        <Card className={styles.summaryCard} noPadding={true}>
            <div className={styles.cardContainer}>
                <p className={styles.title}>{title}</p>
                <p className={`${styles.content} ${style ? styles[style] : ''}`}>{content}</p>
                <p className={styles.description}>{description}</p>
            </div>
        </Card>
    )
}

export default SummaryCard