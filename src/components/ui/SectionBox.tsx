import type { ReactNode } from 'react';

interface SectionBoxProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function SectionBox({ title, children, className = '' }: SectionBoxProps) {
  return (
    <div className={`mb-6 p-4 bg-zinc-800/30 rounded-xl border border-zinc-700 ${className}`}>
      {title && <p className="text-sm text-zinc-400 mb-3">{title}</p>}
      {children}
    </div>
  );
}
