import React from 'react';

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
        <div style={{ marginBottom: 0, marginTop: 0 }}>
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