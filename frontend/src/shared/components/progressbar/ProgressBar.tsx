import React, { useState, useEffect } from 'react';
import styles from './progressbar.module.css';

interface ProgressBarProps {
    total: number;
    used: number;
}

export default function ProgressBar({
    total, used
}: ProgressBarProps) {
    const targetPercentage = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;

    const [currentWidth, setCurrentWidth] = useState(0);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentWidth(targetPercentage);
        }, 50);
        
        return () => clearTimeout(timeoutId);
    }, [targetPercentage]);

    return (
        <div className={styles.progressBarContainer}>
            <div className={styles.progressBarTrack}>
                <div 
                    className={styles.progressBarFill}
                    style={{ width: `${currentWidth}%` }}
                />
            </div>
        </div>
    )
}