import { useId, type InputHTMLAttributes } from 'react';
import type { InputColor } from './types';
import { focusClasses } from './theme';
import { RequiredLabel } from './RequiredLabel';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Input label text */
  label: string;
  /** Color theme for focus state */
  color?: InputColor;
  /** Error message to display */
  error?: string;
  /** Helper text below input */
  helperText?: string;
}

export function Input({
  label,
  color = 'emerald',
  className = '',
  error,
  helperText,
  required,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const hasError = Boolean(error);

  return (
    <div>
      <RequiredLabel htmlFor={inputId} required={required}>
        {label}
      </RequiredLabel>
      <input
        id={inputId}
        required={required}
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? errorId : helperText ? helperId : undefined
        }
        {...props}
        className={`w-full bg-zinc-800/50 border rounded-xl px-4 py-3 text-white focus:ring-1 transition-all ${
          hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : `border-zinc-700 ${focusClasses[color]}`
        } ${className}`}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="mt-1.5 text-sm text-zinc-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
