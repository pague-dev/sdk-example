import type { InputColor } from './types';
import { focusClasses } from './theme';

interface CurrencyInputProps {
  name: string;
  label: string;
  defaultValue?: number;
  color?: InputColor;
  required?: boolean;
}

export function CurrencyInput({ name, label, defaultValue, color = 'emerald', required }: CurrencyInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-400 mb-2">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
        <input
          name={name}
          type="number"
          step="0.01"
          required={required}
          defaultValue={defaultValue}
          className={`w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white ${focusClasses[color]} focus:ring-1 transition-all`}
        />
      </div>
    </div>
  );
}
