import styles from './LoadingText.module.css';

interface LoadingTextProps {
    text?: string;
    className?: string;
}

const LoadingText = ({ text = '불러오는 중이에요...', className }: LoadingTextProps) => {
    return (
        <p className={`${styles.loadingText} ${className ?? ''}`}>{text}</p>
    );
};

export default LoadingText;
