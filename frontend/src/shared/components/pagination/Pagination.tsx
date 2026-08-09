import React from 'react';
import styles from './pagination.module.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const Pagination = ({ currentPage, totalPages, onPageChange, className }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const isFirst = currentPage === 1;
    const isLast = currentPage === totalPages;

    const handleFirst = () => {
        if (!isFirst) onPageChange(1);
    };

    const handlePrev = () => {
        if (!isFirst) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (!isLast) onPageChange(currentPage + 1);
    };

    const handleLast = () => {
        if (!isLast) onPageChange(totalPages);
    };

    return (
        <nav className={`${styles.pagination} ${className ?? ''}`} aria-label="페이지네이션">
            <button
                type="button"
                className={styles.navBtn}
                onClick={handleFirst}
                disabled={isFirst}
                aria-label="첫 페이지"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                        d="M11 12L7 8L11 4M6 12L6 4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            <button
                type="button"
                className={styles.navBtn}
                onClick={handlePrev}
                disabled={isFirst}
                aria-label="이전 페이지"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                        d="M10 12L6 8L10 4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            <ul className={styles.pageList}>
                {pages.map((page) => (
                    <li key={page}>
                        <button
                            type="button"
                            className={`${styles.pageBtn} ${page === currentPage ? styles.active : ''}`}
                            onClick={() => onPageChange(page)}
                            aria-current={page === currentPage ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    </li>
                ))}
            </ul>

            <button
                type="button"
                className={styles.navBtn}
                onClick={handleNext}
                disabled={isLast}
                aria-label="다음 페이지"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                        d="M6 4L10 8L6 12"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            <button
                type="button"
                className={styles.navBtn}
                onClick={handleLast}
                disabled={isLast}
                aria-label="마지막 페이지"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                        d="M5 4L9 8L5 12M10 4L10 12"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </nav>
    );
};

export default Pagination;