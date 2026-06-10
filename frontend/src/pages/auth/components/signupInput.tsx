import React from 'react';

interface signupInputProps {
    id: string;
    label: string;
    type: string;
    value: string;
    required?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SignupInput = ({
    id,
    label,
    type,
    value,
    required = false,
    onChange,
}: signupInputProps) => {
    return (
        <div style={{ marginBottom: 0, marginTop: 0 }}>
            <label htmlFor={id} style={{ marginRight: '5px' }}>{label}</label>
            <input
                id={id}
                type={type}
                value={value}
                required={required}
                onChange={onChange}
            />
        </div>
    );
};

export default SignupInput;