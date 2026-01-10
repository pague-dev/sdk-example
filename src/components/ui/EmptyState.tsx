import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  message: string;
}

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
      <div className="w-16 h-16 mb-4 opacity-50">{icon}</div>
      <p>{message}</p>
    </div>
  );
}
