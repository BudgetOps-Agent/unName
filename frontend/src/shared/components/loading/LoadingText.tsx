import React from 'react';
import styles from './LoadingText.module.css';

interface LoadingTextProps {
    // 문장을 줄 단위로 나눠 넘길 수 있게 ReactNode를 받음
    text?: React.ReactNode;
    className?: string;
}

const LoadingText = ({ text = '불러오는 중이에요...', className }: LoadingTextProps) => {
    return (
        <div className={`${styles.loadingText} ${className ?? ''}`}>
            {/* 문구만 있으면 멈춘 화면처럼 보여서, 도는 스피너를 위에 같이 둠 */}
            <span className={styles.spinner} aria-hidden="true" />
            <p>{text}</p>
        </div>
    );
};

export default LoadingText;