'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, id, ...rest }: InputProps) {
  const field = <input id={id} {...rest} />;

  if (!label) return field;

  return (
    <label htmlFor={id}>
      {label}
      {field}
    </label>
  );
}
