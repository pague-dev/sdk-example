import type { ReactNode } from 'react';
import type { Color } from './types';
import { formHeaderBg } from './theme';

interface FormHeaderProps {
  icon: ReactNode;
  title: string;
  color: Color;
}

export function FormHeader({ icon, title, color }: FormHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 ${formHeaderBg[color]} rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );
}
