/**
 * Maps API error messages to user-friendly Portuguese messages
 */
const errorMessageMap: Record<string, string> = {
  // Validation errors
  'Invalid customer document': 'CPF/CNPJ inválido. Verifique se digitou corretamente.',
  'Invalid document': 'Documento inválido. Use apenas números.',
  'Invalid email': 'Email inválido. Verifique o formato.',
  'Invalid phone': 'Telefone inválido. Use o formato +5511999999999.',
  'Invalid amount': 'Valor inválido. O valor deve ser maior que zero.',

  // Authentication errors
  'Invalid API key': 'API Key inválida. Verifique sua chave no painel.',
  'Unauthorized': 'Não autorizado. Verifique sua API Key.',
  'Missing API key': 'API Key não informada.',

  // Resource errors
  'Project not found': 'Projeto não encontrado.',
  'Customer not found': 'Cliente não encontrado.',
  'Transaction not found': 'Transação não encontrada.',
  'Charge not found': 'Cobrança não encontrada.',

  // Rate limiting
  'Rate limit exceeded': 'Muitas requisições. Aguarde alguns segundos.',
  'Too many requests': 'Limite de requisições excedido. Tente novamente em breve.',

  // Network errors
  'NetworkError': 'Erro de conexão. Verifique sua internet.',
  'Unable to fetch data': 'Não foi possível conectar ao servidor.',

  // Generic errors
  'Bad Request': 'Requisição inválida. Verifique os dados informados.',
  'Internal Server Error': 'Erro interno do servidor. Tente novamente.',
  'Service Unavailable': 'Serviço indisponível. Tente novamente em alguns minutos.',
};

interface ApiError {
  statusCode?: number | null;
  error?: string;
  message?: string;
}

/**
 * Formats an API error object into a user-friendly message
 */
export function formatApiError(error: unknown): string {
  // If it's already a string, try to parse it
  if (typeof error === 'string') {
    const errorStr = error;
    try {
      const parsed = JSON.parse(errorStr);
      error = parsed;
    } catch {
      // Check if the string itself is a known error
      return errorMessageMap[errorStr] || errorStr;
    }
  }

  // If it's not an object, return generic message
  if (typeof error !== 'object' || error === null) {
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  const apiError = error as ApiError;

  // Try to find a user-friendly message
  if (apiError.message) {
    const friendlyMessage = errorMessageMap[apiError.message];
    if (friendlyMessage) return friendlyMessage;
  }

  if (apiError.error) {
    const friendlyMessage = errorMessageMap[apiError.error];
    if (friendlyMessage) return friendlyMessage;
  }

  // If no mapping found, try to create a readable message
  if (apiError.message) {
    // Convert camelCase or snake_case to readable text
    const readable = apiError.message
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .toLowerCase()
      .trim();

    // Capitalize first letter
    return readable.charAt(0).toUpperCase() + readable.slice(1) + '.';
  }

  // If we have a status code, provide context
  if (apiError.statusCode) {
    switch (apiError.statusCode) {
      case 400:
        return 'Dados inválidos. Verifique as informações e tente novamente.';
      case 401:
        return 'Não autorizado. Verifique sua API Key.';
      case 403:
        return 'Acesso negado. Você não tem permissão para esta ação.';
      case 404:
        return 'Recurso não encontrado.';
      case 429:
        return 'Muitas requisições. Aguarde alguns segundos.';
      case 500:
        return 'Erro interno do servidor. Tente novamente.';
      case 502:
      case 503:
      case 504:
        return 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
      default:
        return `Erro ${apiError.statusCode}. Tente novamente.`;
    }
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}

/**
 * Checks if an error is a network/connection error
 */
export function isNetworkError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    return apiError.error === 'NetworkError' || apiError.statusCode === null;
  }
  return false;
}

/**
 * Checks if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    return apiError.statusCode === 401 || apiError.statusCode === 403;
  }
  return false;
}
