import React from 'react';
import styles from "./Card.module.css";

interface CardProps {
    className?: string;
    noPadding?: boolean;
    children: React.ReactNode;
    title?: string;
    desc?: string;
    count?: number;           // 추가
    headerRight?: React.ReactNode; 
}

export const Card = ({ className, noPadding, children, title, desc, count, headerRight}: CardProps) => {
  return (
    <div className={`${styles.card} ${className} ${noPadding ? styles.noPadding : ''}`}>
        {(title || headerRight) && (
              <div className="card-title">
                    <div className="title-left">
                        {title && <p className="title">{title}</p>}
                        {desc && <span className="desc">{desc}</span>}
                        {count !== undefined && <span className="count">{count}</span>}
                    </div>
                    {headerRight}
              </div>
        )}
        {children}
    </div>
  )
}
