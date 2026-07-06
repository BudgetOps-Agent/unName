import React from 'react';

interface ProgressBarProps {
    total: number;
    used: number;
}

export default function ProgressBar({
    total, used
}: ProgressBarProps) {
    const percentage = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0;

    return (
        <div className="progress-bar-container">
            <div className="progress-bar-track">
                <div 
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}