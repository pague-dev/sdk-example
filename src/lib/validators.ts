/**
 * Removes all non-digit characters from a string
 */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Validates a Brazilian CPF (11 digits)
 */
export function validateCPF(cpf: string): boolean {
  const digits = onlyDigits(cpf);

  if (digits.length !== 11) return false;

  // Check for known invalid patterns (all same digit)
  if (/^(\d)\1+$/.test(digits)) return false;

  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;

  return true;
}

/**
 * Validates a Brazilian CNPJ (14 digits)
 */
export function validateCNPJ(cnpj: string): boolean {
  const digits = onlyDigits(cnpj);

  if (digits.length !== 14) return false;

  // Check for known invalid patterns (all same digit)
  if (/^(\d)\1+$/.test(digits)) return false;

  // Validate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const firstCheckDigit = remainder < 2 ? 0 : 11 - remainder;
  if (firstCheckDigit !== parseInt(digits[12])) return false;

  // Validate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weights2[i];
  }
  remainder = sum % 11;
  const secondCheckDigit = remainder < 2 ? 0 : 11 - remainder;
  if (secondCheckDigit !== parseInt(digits[13])) return false;

  return true;
}

/**
 * Validates a Brazilian document (CPF or CNPJ)
 */
export function validateDocument(document: string): boolean {
  const digits = onlyDigits(document);

  if (digits.length === 11) {
    return validateCPF(digits);
  }

  if (digits.length === 14) {
    return validateCNPJ(digits);
  }

  return false;
}

/**
 * Formats a CPF (000.000.000-00)
 */
export function formatCPF(cpf: string): string {
  const digits = onlyDigits(cpf).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Formats a CNPJ (00.000.000/0000-00)
 */
export function formatCNPJ(cnpj: string): string {
  const digits = onlyDigits(cnpj).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/**
 * Formats a document (CPF or CNPJ) based on length
 */
export function formatDocument(document: string): string {
  const digits = onlyDigits(document);
  if (digits.length <= 11) {
    return formatCPF(digits);
  }
  return formatCNPJ(digits);
}

/**
 * Gets document type based on length
 */
export function getDocumentType(document: string): 'cpf' | 'cnpj' | null {
  const digits = onlyDigits(document);
  if (digits.length === 11) return 'cpf';
  if (digits.length === 14) return 'cnpj';
  return null;
}

/**
 * Validates an email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a Brazilian phone number
 */
export function validatePhone(phone: string): boolean {
  const digits = onlyDigits(phone);
  // Accept 10 (landline) or 11 (mobile) digits, or with country code (12-13)
  return digits.length >= 10 && digits.length <= 13;
}

/**
 * Formats a phone number
 */
export function formatPhone(phone: string): string {
  const digits = onlyDigits(phone);

  // With country code: +55 (11) 99999-9999
  if (digits.length === 13) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 12) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`;
  }

  // Without country code: (11) 99999-9999
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return phone;
}
