import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { Color } from './types';
import { buttonColors } from './theme';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  color?: Color;
  children: ReactNode;
}

export function Button({
  loading,
  loadingText,
  color = 'emerald',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const colorStyle = buttonColors[color];

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`w-full disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-xl px-6 py-4 font-semibold text-lg transition-all shadow-lg ${colorStyle.primary} ${colorStyle.shadow} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner size="md" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
