import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
    className?: string;
    text?: string;
    style?: 'blue' | 'purple' | 'gray' | 'yellow' | 'red' | 'green' | 'orange'
    size?: 'sm'
}

export const Badge = ({ className, text, style, size }: BadgeProps) => {
    return (
        <span className={`${styles.badge} ${className} ${styles[`${style}`]} ${size ? styles[size] : ''}`}>
            {text}
        </span>
    )
}