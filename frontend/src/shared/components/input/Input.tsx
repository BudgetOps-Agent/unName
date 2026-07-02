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
}

const Input = ({
    id,
    label,
    type,
    value,
    placeholder = '',
    required = false,
    onChange,
}: InputProps) => {
    return (
        <div className={styles["input-wrap"]}>
            <label htmlFor={id} style={{ marginRight: '5px' }}>{label}</label>
            <input
                id={id}
                type={type}
                value={value}
                placeholder={placeholder}
                required={required}
                onChange={onChange}
            />
        </div>
    );
};

export default Input;