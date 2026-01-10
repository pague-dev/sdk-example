import type { TabColor } from './types';
import { toggleActiveClasses } from './theme';

interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  color: TabColor;
}

export function ToggleGroup({ options, value, onChange, color }: ToggleGroupProps) {
  return (
    <div className="flex gap-2 mb-4">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            value === option.value
              ? toggleActiveClasses[color]
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
