import React from 'react';
import styles from "./Input.module.css"

interface InputProps {
    id: string;
    label: string;
    type: string;
    value: string;
    placeholder?: string;
    required?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

const Input = ({
    id,
    label,
    type,
    value,
    placeholder = '',
    required = false,
    onChange,
    onFocus,
    error,
}: InputProps) => {
    return (
        <div className={styles["input-wrap"]}>
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                type={type}
                value={value}
                placeholder={placeholder}
                required={required}
                onChange={onChange}
                onFocus={onFocus}
            />

            {error && (
                <p className={styles.error}>{error}</p>
            )}
        </div>
    );
};

export default Input;