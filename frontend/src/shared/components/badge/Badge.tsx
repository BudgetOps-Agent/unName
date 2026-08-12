import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
    className?: string;
    text?: string;
    icon?: React.ReactNode;
    style?: 'blue' | 'purple' | 'gray' | 'yellow' | 'red' | 'green' | 'orange'
    size?: 'sm'
}

export const Badge = ({ className, text, icon, style, size }: BadgeProps) => {
    return (
        <span className={`${styles.badge} ${className} ${styles[`${style}`]} ${size ? styles[size] : ''}`}>
            {icon && <span className={styles.icon}>{icon}</span>}
            {text}
        </span>
    )
}