import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
    // 버튼 속성
    id?: string;
    className?: string;
    text: React.ReactNode;
    blind?: boolean;
    disabled?: boolean
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    iconOnly?: boolean;
    // 헤더 영역
    headerContent?: React.ReactNode;
    // 메인 콘텐츠 영역
    items?: any[];
    renderItem?: (item: any, index: number) => React.ReactNode;
    // 푸터 영역
    footerContent?: React.ReactNode;
}

const Dropdown = ({
    id, className, text, blind, disabled, iconLeft, iconRight, iconOnly, headerContent, items, renderItem, footerContent
}: DropdownProps) => {

    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const openDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);

        console.log('Dropdown open state:', !isDropdownOpen);
    };

    useEffect(() => {
        const handleOutsideClick = (e:MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isDropdownOpen]);

    return (
        <div className= {`dropdown ${className ?? ''}`} ref={dropdownRef}>
            <button 
                type="button"
                id={id}
                className={`${className}-btn ${iconOnly ? `${className}-btn-icon` : ''}`}
                onClick={openDropdown}
                disabled={disabled}

            >
                {iconLeft && <span className={`${className}-icon-left`}>{iconLeft}</span>}
                
                <span className={blind || iconOnly ? 'blind' : ''}>{text}</span>
                
                {iconRight && <span className={`${className}-icon-right`}>{iconRight}</span>}
            </button>

            {isDropdownOpen && (
                <div className="dropdown-container">
                    {headerContent && <div className="dropdown-header">{headerContent}</div>}

                    {items && renderItem && (
                        <div className="dropdown-items">
                            {items.map((item, index) => renderItem(item, index))}
                        </div>
                    )}

                    {footerContent && <div className="dropdown-footer">{footerContent}</div>}
                </div>
            )}
        </div>
    )
}

export default Dropdown;