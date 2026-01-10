import { useState } from 'react';

interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string;
  /** Button label (default: "Copiar") */
  label?: string;
  /** Label shown after successful copy (default: "Copiado!") */
  successLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /** Button variant */
  variant?: 'default' | 'primary' | 'inline';
  /** Color for primary variant */
  color?: 'emerald' | 'blue' | 'purple' | 'orange' | 'violet';
}

export function CopyButton({
  text,
  label = 'Copiar',
  successLabel = 'Copiado!',
  className = '',
  variant = 'default',
  color = 'blue',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const baseClasses = 'font-medium transition-colors';

  const variantClasses = {
    default: 'bg-zinc-700 hover:bg-zinc-600 px-4 py-1.5 rounded-lg text-sm',
    primary: `w-full px-4 py-3 rounded-xl bg-${color}-600 hover:bg-${color}-700`,
    inline: 'bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg text-sm',
  };

  // For primary variant, we need to handle dynamic colors
  const primaryColors: Record<string, string> = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    violet: 'bg-violet-600 hover:bg-violet-700',
  };

  const getVariantClass = () => {
    if (variant === 'primary') {
      return `w-full px-4 py-3 rounded-xl ${primaryColors[color]}`;
    }
    return variantClasses[variant];
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`${baseClasses} ${getVariantClass()} ${className}`}
      aria-label={copied ? successLabel : label}
    >
      {copied ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
