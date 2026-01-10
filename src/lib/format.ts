/**
 * Format a number as Brazilian currency (BRL)
 */
export function formatCurrency(amount: number, currency: string = 'BRL'): string {
  const symbol = currency === 'BRL' ? 'R$' : currency;
  return `${symbol} ${amount.toFixed(2)}`;
}

/**
 * Date formatter for pt-BR locale
 */
const ptBrFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/**
 * Format a date string or Date object to pt-BR format
 */
export function formatDatePtBR(date: string | Date): string {
  return ptBrFormatter.format(new Date(date));
}

/**
 * Parse a form field value
 */
export function parseFormField(
  formData: FormData,
  key: string,
  type: 'string' | 'number' = 'string'
): string | number | undefined {
  const value = formData.get(key);
  if (!value) return undefined;
  if (type === 'number') return parseFloat(value as string);
  return value as string;
}

/**
 * Parse an optional string form field (returns undefined if empty)
 */
export function parseOptionalField(formData: FormData, key: string): string | undefined {
  const value = formData.get(key) as string;
  return value || undefined;
}
