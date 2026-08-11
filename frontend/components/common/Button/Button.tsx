'use client';

import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

export default function Button({ variant = 'primary', style, ...rest }: ButtonProps) {
  const outlineStyle =
    variant === 'outline' ? { background: 'transparent', border: '1px solid var(--border)' } : undefined;

  return <button style={{ ...outlineStyle, ...style }} {...rest} />;
}
