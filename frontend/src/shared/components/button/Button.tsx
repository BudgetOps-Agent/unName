import React from 'react';
import styles from "./Button.module.css"
import Link from "next/link";

interface ButtonProps {
    id?: string
    className?: string
    type?: "button" | "submit" | "reset"
    text?: React.ReactNode;
    blind?: boolean
    disabled?: boolean
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
    iconOnly?: boolean;
    size?: "sm" | "md" | "lg" | "xl"
    style?: "primary" | "secondary" | "tertiary" | "ghost"
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    href?: string;
}

const Button = ({ 
    id, 
    className, 
    type = "button", 
    text, 
    blind, 
    disabled, 
    iconLeft, 
    iconRight, 
    iconOnly, 
    size="sm", 
    style="primary", 
    onClick,
    href
}: ButtonProps) => {
    const buttonClass = `
        ${styles.btn}
        ${styles[`btn-${style}`]}
        ${styles[`btn-${size}`]}
        ${iconOnly ? `${styles["btn-icon"]} ${styles[`icon-${iconOnly}`]}` : ""}
        ${className ?? ""}
    `
    const content = (
        <>
            {iconLeft && (
                <span className={`${styles["btn__icon"]} ${styles["btn__icon--left"]}`}>
                    {iconLeft}
                </span>
            )}

            {text && (
                <span className={blind || iconOnly ? styles.blind : ""}>
                    {text}
                </span>
            )}

            {iconRight && (
                <span className={`${styles["btn__icon"]} ${styles["btn__icon--right"]}`}>
                    {iconRight}
                </span>
            )}
        </>
    )

    if (href) {
        return (
        <Link href={href} className={buttonClass}>
            {content}
        </Link>
        );
    }

    return (
        <button
            type={type}
            id={id}
            className={buttonClass}
            onClick={onClick}
            disabled={disabled}
        >
            {content}
        </button>
    )
}

export default Button