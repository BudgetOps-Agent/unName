import React from 'react';
import styles from "./Card.module.css";
import Link from 'next/link';

interface CardProps {
    className?: string;
    noPadding?: boolean;
    children?: React.ReactNode;
    title?: string;
    desc?: string;
    count?: React.ReactNode;          
    headerRight?: React.ReactNode; 
    href?: string;
    linkText?: string;
    noData?: string;
}

export const Card = ({ className, noPadding, children, title, desc, count, headerRight, href, linkText, noData }: CardProps) => {
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

                {href && (
                      <Link href={href} className="link">{linkText}</Link>
                )}
            </div>
        )}

        {noData && (
              <p className={styles.empty}>{noData}</p>
        )}
        {children}
    </div>
  )
}
