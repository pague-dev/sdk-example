interface InfoCardProps {
  label: string;
  value: string | number;
  colSpan?: 1 | 2;
  valueClassName?: string;
}

export function InfoCard({ label, value, colSpan = 1, valueClassName = '' }: InfoCardProps) {
  return (
    <div className={`bg-zinc-800/50 rounded-xl p-4 ${colSpan === 2 ? 'col-span-2' : ''}`}>
      <p className="text-zinc-500 text-sm">{label}</p>
      <p className={`text-lg font-semibold ${valueClassName}`}>{value}</p>
    </div>
  );
}
