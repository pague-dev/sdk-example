import type { ReactNode } from 'react';
import { Card, Alert, EmptyState } from '../ui';

interface FormFlowLayoutProps<T> {
  formContent: ReactNode;
  result: T | null;
  error: string | null;
  emptyIcon: ReactNode;
  emptyMessage: string;
  children: (result: T) => ReactNode;
}

/**
 * Generic layout for form flows with form on left and result on right.
 * Reduces duplication across PixFlow, PaymentLinkFlow, CustomersFlow, and TransactionsFlow.
 */
export function FormFlowLayout<T>({
  formContent,
  result,
  error,
  emptyIcon,
  emptyMessage,
  children,
}: FormFlowLayoutProps<T>) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Card */}
      <Card>{formContent}</Card>

      {/* Result Card */}
      <Card>
        <h2 className="text-2xl font-bold mb-6">Resultado</h2>

        {error && (
          <Alert type="error" title="Erro na requisicao" message={error} className="mb-4" />
        )}

        {result ? children(result) : <EmptyState icon={emptyIcon} message={emptyMessage} />}
      </Card>
    </div>
  );
}
