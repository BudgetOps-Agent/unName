import React from 'react';
import styles from "./Button.module.css"
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
  style?: "primary" | "secondary"
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const Button = ({ 
  id, className, type = "button", text, blind, disabled, iconLeft, iconRight, iconOnly, size="sm", style="primary", onClick 
}: ButtonProps) => {
  return (
    <button 
      type={type} 
      id={id} 
      className={`btn btn-${style} btn-${size} ${iconOnly ? `btn-icon icon-${iconOnly}` : ''} ${className ?? ''} `} 
      onClick={onClick} 
      disabled={disabled}
    >
      {iconLeft && <span className="btn__icon btn__icon--left">{iconLeft}</span>}
      
      {text && <span className={blind || iconOnly ? 'blind' : ''}>{text}</span>}
      
      {iconRight && <span className="btn__icon btn__icon--right">{iconRight}</span>}
    </button>
  )
}

export default Button