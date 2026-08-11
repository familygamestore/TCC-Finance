import { ReactNode } from 'react';

interface CardProps {
  label: string;
  value: ReactNode;
}

export default function Card({ label, value }: CardProps) {
  return (
    <div className="card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}
