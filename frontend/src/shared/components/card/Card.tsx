import React from 'react';
import styles from "./Card.module.css";

interface CardProps {
    className?: string;
    noPadding?: boolean;
    children: React.ReactNode;
    style?: 'smallCard';
}

export const Card = ({ className, noPadding, children, style }: CardProps) => {
  return (
    <div className={`${styles.card} ${className} ${noPadding ? styles.noPadding : ''} ${styles[`${style}`]}`}>
        {children}
    </div>
  )
}
