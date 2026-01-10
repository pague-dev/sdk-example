import type { SelectHTMLAttributes } from 'react';
import type { InputColor } from './types';
import { focusClasses } from './theme';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string;
  options: SelectOption[];
  color?: InputColor;
}

export function Select({ label, options, color = 'emerald', className = '', ...props }: SelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-400 mb-2">{label}</label>
      <select
        {...props}
        className={`w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white ${focusClasses[color]} focus:ring-1 transition-all ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
