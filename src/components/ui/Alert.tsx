import type { AlertType, Color } from './types';
import { alertStyles, alertColorOverrides } from './theme';

interface AlertAction {
  label: string;
  onClick: () => void;
}

interface AlertProps {
  type: AlertType;
  title: string;
  message?: string;
  color?: Color;
  className?: string;
  /** Optional action button */
  action?: AlertAction;
  /** Whether to format message as code (default: true for errors) */
  formatAsCode?: boolean;
}

export function Alert({
  type,
  title,
  message,
  color,
  className = '',
  action,
  formatAsCode,
}: AlertProps) {
  const baseStyle = alertStyles[type];
  const override = color && alertColorOverrides[color];

  const bg = override?.bg || baseStyle.bg;
  const border = override?.border || baseStyle.border;
  const titleColor = override?.titleColor || baseStyle.titleColor;
  const messageColor = baseStyle.messageColor;

  // Default: format as code for errors, plain text for others
  const shouldFormatAsCode = formatAsCode ?? type === 'error';

  return (
    <div
      className={`${bg} border ${border} rounded-xl p-4 ${className}`}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={`${titleColor} font-medium mb-1`}>{title}</p>
          {message && (
            shouldFormatAsCode ? (
              <pre className={`text-sm ${messageColor} overflow-auto whitespace-pre-wrap`}>
                {message}
              </pre>
            ) : (
              <p className={`text-sm ${messageColor}`}>{message}</p>
            )
          )}
        </div>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className={`${titleColor} text-sm font-medium hover:underline flex-shrink-0`}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
