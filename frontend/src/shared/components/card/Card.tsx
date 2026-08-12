import React from 'react';
import styles from "./Card.module.css";
import Link from 'next/link';

interface CardProps {
    className?: string;
    noPadding?: boolean;
    small?: boolean;
    children?: React.ReactNode;
    title?: string;
    desc?: string;
    count?: React.ReactNode;
    headerRight?: React.ReactNode;
    href?: string;
    linkText?: string;
    noData?: string;
}

export const Card = ({ className, noPadding, small, children, title, desc, count, headerRight, href, linkText, noData }: CardProps) => {
  return (
    <div className={`${styles.card} ${className ?? ''} ${noPadding ? styles.noPadding : ''} ${small ? styles.smallCard : ''}`}>
        {(title || headerRight) && (
            <div className="card-title">
                <div className="title-left">
                    {title && <p className="title">{title}</p>}
                    {desc && <span className="desc">[TEST-123]{desc}</span>}
                    {count !== undefined && <span className="count">{count}</span>}
                </div>
                  <div className="title-right">{headerRight}</div>

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
