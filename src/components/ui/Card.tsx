import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-zinc-900/50 backdrop-blur rounded-3xl p-8 border border-zinc-800 ${className}`}>
      {children}
    </div>
  );
}
