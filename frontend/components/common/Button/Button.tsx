import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary'|'secondary'|'danger'; }
export default function Button({ variant='primary', className='', children, ...props }: ButtonProps) { return <button className={`btn ${variant === 'primary' ? '' : variant} ${className}`} {...props}>{children}</button>; }
