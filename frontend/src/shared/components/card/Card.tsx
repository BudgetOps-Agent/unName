import React from 'react';
import styles from "./Card.module.css";

interface CardProps {
    className?: string;
    children: React.ReactNode;
}

export const Card = ({ className, children }: CardProps) => {
  return (
    <div className={`card ${styles.card} ${className}`}>
        {children}
    </div>
  )
}
