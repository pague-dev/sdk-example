import type { ReactNode } from 'react';
import type { TabColor } from './types';
import { tabActiveClasses } from './theme';

interface TabButtonProps {
  active: boolean;
  color: TabColor;
  onClick: () => void;
  children: ReactNode;
}

export function TabButton({ active, color, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
        active ? tabActiveClasses[color] : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
      }`}
    >
      {children}
    </button>
  );
}
