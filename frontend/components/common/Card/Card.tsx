interface CardProps { label: string; value: string | number; icon?: string; }
export default function Card({ label, value, icon = '◆' }: CardProps) {
  return <div className="card"><div className="metric-icon" aria-hidden="true">{icon}</div><div className="label">{label}</div><div className="value">{value}</div></div>;
}
