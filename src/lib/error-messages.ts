/**
 * Maps API error messages to user-friendly Portuguese messages
 */
const errorMessageMap: Record<string, string> = {
  // Validation errors
  'Invalid customer document': 'CPF/CNPJ invalido. Verifique se digitou corretamente.',
  'Invalid document': 'Documento invalido. Use apenas numeros.',
  'Invalid email': 'Email invalido. Verifique o formato.',
  'Invalid phone': 'Telefone invalido. Use o formato +5511999999999.',
  'Invalid amount': 'Valor invalido. O valor deve ser maior que zero.',

  // Authentication errors
  'Invalid API key': 'API Key invalida. Verifique sua chave no painel.',
  'Unauthorized': 'Nao autorizado. Verifique sua API Key.',
  'Missing API key': 'API Key nao informada.',

  // Resource errors
  'Project not found': 'Projeto nao encontrado.',
  'Customer not found': 'Cliente nao encontrado.',
  'Transaction not found': 'Transacao nao encontrada.',
  'Charge not found': 'Cobranca nao encontrada.',

  // Rate limiting
  'Rate limit exceeded': 'Muitas requisicoes. Aguarde alguns segundos.',
  'Too many requests': 'Limite de requisicoes excedido. Tente novamente em breve.',

  // Network errors
  'NetworkError': 'Erro de conexao. Verifique sua internet.',
  'Unable to fetch data': 'Nao foi possivel conectar ao servidor.',

  // Generic errors
  'Bad Request': 'Requisicao invalida. Verifique os dados informados.',
  'Internal Server Error': 'Erro interno do servidor. Tente novamente.',
  'Service Unavailable': 'Servico indisponivel. Tente novamente em alguns minutos.',
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
        return 'Dados invalidos. Verifique as informacoes e tente novamente.';
      case 401:
        return 'Nao autorizado. Verifique sua API Key.';
      case 403:
        return 'Acesso negado. Voce nao tem permissao para esta acao.';
      case 404:
        return 'Recurso nao encontrado.';
      case 429:
        return 'Muitas requisicoes. Aguarde alguns segundos.';
      case 500:
        return 'Erro interno do servidor. Tente novamente.';
      case 502:
      case 503:
      case 504:
        return 'Servico temporariamente indisponivel. Tente novamente em alguns minutos.';
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
