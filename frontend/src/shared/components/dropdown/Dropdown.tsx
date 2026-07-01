import React from 'react';

interface DropdownProps {
    className?: string
    // 헤더 영역
    headerContent?: React.ReactNode;
    // 메인 콘텐츠 영역
    items?: any[];
    renderItem?: (item: any, index: number) => React.ReactNode;
    // 푸터 영역
    footerContent?: React.ReactNode;
}

const Dropdown = ({
    className, headerContent, items, renderItem, footerContent
}: DropdownProps) => {
    return (
        <div className={`dropdown-container ${className ?? ''}`}>
            {headerContent && <div className="dropdown-header">{headerContent}</div>}

            {items && renderItem && (
                <div className="dropdown-items">
                    {items.map((item, index) => renderItem(item, index))}
                </div>
            )}

            {footerContent && <div className="dropdown-footer">{footerContent}</div>}
        </div>
    )
}

export default Dropdown;