import React from 'react';
import styles from "./Card.module.css";

interface CardProps {
    className?: string;
    noPadding?: boolean;
    children: React.ReactNode;
}

export const Card = ({ className, noPadding, children }: CardProps) => {
  return (
    <div className={`${styles.card} ${className} ${noPadding ? styles.noPadding : ''}`}>
        {children}
    </div>
  )
}
