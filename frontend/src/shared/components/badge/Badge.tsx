import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
    className?: string;
    text?: string;
    style?: 'blue' | 'purple' | 'gray' | 'yellow' | 'red' | 'green'
}

export const Badge = ({ className, text, style }: BadgeProps) => {
    return (
        <span className={`${styles.badge} ${className} ${styles[`${style}`]}`}>
            {text}
        </span>
    )
}