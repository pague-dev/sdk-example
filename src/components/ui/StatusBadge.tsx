type Status = 'paid' | 'pending' | 'expired' | 'cancelled' | string;

const statusStyles: Record<string, string> = {
  paid: 'bg-emerald-500/20 text-emerald-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  pending: 'bg-amber-500/20 text-amber-400',
  expired: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-red-500/20 text-red-400',
  failed: 'bg-red-500/20 text-red-400',
};

const defaultStyle = 'bg-zinc-500/20 text-zinc-400';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const style = statusStyles[status] || defaultStyle;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${style} ${className}`}>
      {status}
    </span>
  );
}
