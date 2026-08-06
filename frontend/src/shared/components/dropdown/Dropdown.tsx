import React, { useState, useRef, useEffect } from 'react';
import styles from "./Dropdown.module.css";

interface DropdownProps {
    id?: string;
    className?: string;
    text: React.ReactNode;
    blind?: boolean;
    disabled?: boolean
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    iconOnly?: boolean;
    headerContent?: React.ReactNode;
    items?: any[];
    renderItem?: (item: any, index: number) => React.ReactNode;
    value?: string | number | string[];
    getItemValue?: (item: any) => string | number;
    footerContent?: React.ReactNode;
    badge?: React.ReactNode;
    emptyContent?: React.ReactNode;
}

const Dropdown = ({
    id, className, text, blind, disabled, iconLeft, iconRight, iconOnly, headerContent, items, renderItem, value, getItemValue, footerContent, badge, emptyContent
}: DropdownProps) => {

    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const closeDropdown = () => {
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
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

    const dropdownValue = Array.isArray(value) ? value[0] : value;

    return (
        <div className={`dropdown ${className ?? ''}`} ref={dropdownRef}>
            <button
                type="button"
                id={id}
                className={`${className}-btn ${iconOnly ? `${className}-btn-icon` : ''} ${isDropdownOpen ? `${className}-btn-active` : ''}`}
                onClick={toggleDropdown}
                disabled={disabled}
            >
                {iconLeft && <span className={`${className}-icon-left`}>{iconLeft}</span>}
                <span className={`${className}-btn-text ${blind || iconOnly ? 'blind' : ''}`}>{text}</span>
                {iconRight && <span className={`${className}-icon-right ${isDropdownOpen ? 'rotate' : ''}`}>{iconRight}</span>}
            </button>

            {badge}

            {isDropdownOpen && (
                <div className="dropdown-container">
                    {headerContent && <div className="dropdown-header">{headerContent}</div>}

                    {items && renderItem && (
                        items.length === 0 && emptyContent ? (
                            emptyContent
                        ) : (
                            <div className="dropdown-items" onClick={closeDropdown}>
                                {items.map((item, index) => {
                                    const isSelected = dropdownValue !== undefined && getItemValue
                                        ? String(getItemValue(item)) === String(dropdownValue)
                                        : false;

                                    return (
                                        <div key={index} className={isSelected ? styles.active : undefined}>
                                            {renderItem(item, index)}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {footerContent && <div className="dropdown-footer" onClick={closeDropdown}>{footerContent}</div>}
                </div>
            )}
        </div>
    )
}

export default Dropdown;