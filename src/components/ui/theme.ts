import type { Color, InputColor, TabColor, AlertType } from './types';

// Focus classes for input elements
export const focusClasses: Record<InputColor, string> = {
  emerald: 'focus:border-emerald-500 focus:ring-emerald-500',
  blue: 'focus:border-blue-500 focus:ring-blue-500',
  purple: 'focus:border-purple-500 focus:ring-purple-500',
  orange: 'focus:border-orange-500 focus:ring-orange-500',
  violet: 'focus:border-violet-500 focus:ring-violet-500',
};

// Background colors for buttons
export const buttonColors: Record<Color, { primary: string; shadow: string }> = {
  emerald: {
    primary: 'bg-emerald-600 hover:bg-emerald-700',
    shadow: 'shadow-emerald-600/20 hover:shadow-emerald-600/30',
  },
  blue: {
    primary: 'bg-blue-600 hover:bg-blue-700',
    shadow: 'shadow-blue-600/20 hover:shadow-blue-600/30',
  },
  purple: {
    primary: 'bg-purple-600 hover:bg-purple-700',
    shadow: 'shadow-purple-600/20 hover:shadow-purple-600/30',
  },
  orange: {
    primary: 'bg-orange-600 hover:bg-orange-700',
    shadow: 'shadow-orange-600/20 hover:shadow-orange-600/30',
  },
  zinc: {
    primary: 'bg-zinc-700 hover:bg-zinc-600',
    shadow: 'shadow-zinc-700/20',
  },
  violet: {
    primary: 'bg-violet-600 hover:bg-violet-700',
    shadow: 'shadow-violet-600/20 hover:shadow-violet-600/30',
  },
};

// Tab active classes
export const tabActiveClasses: Record<TabColor, string> = {
  emerald: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30',
  blue: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30',
  purple: 'bg-purple-600 text-white shadow-lg shadow-purple-600/30',
  orange: 'bg-orange-600 text-white shadow-lg shadow-orange-600/30',
  violet: 'bg-violet-600 text-white shadow-lg shadow-violet-600/30',
};

// Toggle active classes
export const toggleActiveClasses: Record<TabColor, string> = {
  emerald: 'bg-emerald-600 text-white',
  blue: 'bg-blue-600 text-white',
  purple: 'bg-purple-600 text-white',
  orange: 'bg-orange-600 text-white',
  violet: 'bg-violet-600 text-white',
};

// Alert styles by type
export const alertStyles: Record<AlertType, { bg: string; border: string; titleColor: string; messageColor: string }> = {
  error: {
    bg: 'bg-red-900/30',
    border: 'border-red-800',
    titleColor: 'text-red-400',
    messageColor: 'text-red-300',
  },
  success: {
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-800',
    titleColor: 'text-emerald-400',
    messageColor: 'text-zinc-400',
  },
  warning: {
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/50',
    titleColor: 'text-amber-400',
    messageColor: 'text-amber-200/70',
  },
};

// Color overrides for alerts (when using specific brand colors)
export const alertColorOverrides: Partial<Record<Color, { bg: string; border: string; titleColor: string }>> = {
  blue: { bg: 'bg-blue-900/20', border: 'border-blue-800', titleColor: 'text-blue-400' },
  purple: { bg: 'bg-purple-900/20', border: 'border-purple-800', titleColor: 'text-purple-400' },
  orange: { bg: 'bg-orange-900/20', border: 'border-orange-800', titleColor: 'text-orange-400' },
};

// Form header icon background
export const formHeaderBg: Record<Color, string> = {
  emerald: 'bg-emerald-600',
  blue: 'bg-blue-600',
  purple: 'bg-purple-600',
  orange: 'bg-orange-600',
  zinc: 'bg-zinc-600',
  violet: 'bg-violet-600',
};

// Radio button colors
export const radioColors: Record<TabColor, string> = {
  emerald: 'text-emerald-600',
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  violet: 'text-violet-600',
};

// Default colors for selectors
export const selectorDefaults = {
  emerald: '#10b981',
  blue: '#3b82f6',
  purple: '#9333ea',
} as const;
