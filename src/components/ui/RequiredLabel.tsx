interface RequiredLabelProps {
  /** Label text */
  children: string;
  /** Whether field is required */
  required?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** HTML for attribute */
  htmlFor?: string;
}

export function RequiredLabel({
  children,
  required = false,
  className = '',
  htmlFor,
}: RequiredLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-zinc-400 mb-2 ${className}`}
    >
      {children}
      {required && (
        <span className="text-red-400 ml-1" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
