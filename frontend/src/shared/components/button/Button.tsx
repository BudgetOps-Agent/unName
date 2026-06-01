import "./Button.css"

interface Props {
  id?: string
  className?: string
  type?: "button" | "submit" | "reset"
  text: string
  blind?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  iconOnly?: string
  size?: "sm" | "md" | "lg" | "xl"
  style?: "primary" | "secondary"
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const Button = ({ 
  id, className, type = "button", text, blind, disabled, icon, iconOnly, size="md", style="primary", onClick 
}: Props) => {
  return (
    <button 
      type={type} 
      id={id} 
      className={`btn btn-${style} btn-${size} ${iconOnly ? `btn-icon icon-${iconOnly}` : ''} ${className ?? ''} `} 
      onClick={onClick} 
      disabled={disabled}
    >
      {icon && <span className="btn__icon">{icon}</span>}
      <span className={blind || iconOnly ? 'blind' : ''}>{text}</span>
    </button>
  )
}

export default Button