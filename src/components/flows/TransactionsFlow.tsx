import type { Transaction } from '@pague-dev/sdk-node';
import { Card, FormHeader, Button, Alert, InfoCard, ClipboardIcon, SearchIcon, StatusBadge } from '../ui';
import { formatCurrency, formatDatePtBR } from '@/lib/format';

interface TransactionsFlowProps {
  apiKey: string;
  transactionId: string;
  setTransactionId: (value: string) => void;
  loading: boolean;
  error: string | null;
  transactionResult: Transaction | null;
  onSearch: () => void;
}

export function TransactionsFlow({
  apiKey,
  transactionId,
  setTransactionId,
  loading,
  error,
  transactionResult,
  onSearch,
}: TransactionsFlowProps) {
  const canSearch = apiKey && transactionId.trim();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Search Form */}
      <Card>
        <FormHeader icon={<ClipboardIcon />} title="Buscar Transação" color="orange" />

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">ID da Transação</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Digite o ID da transação (UUID)"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>

          <Button
            type="button"
            color="orange"
            loading={loading}
            loadingText="Buscando..."
            disabled={!canSearch}
            onClick={onSearch}
          >
            Buscar Transação
          </Button>
        </div>

        {error && (
          <div className="mt-6">
            <Alert type="error" title="Erro na requisição" message={error} />
          </div>
        )}
      </Card>

      {/* Result */}
      <Card>
        <h2 className="text-2xl font-bold mb-6">Resultado</h2>

        {transactionResult ? (
          <div className="space-y-4">
            <Alert
              type="success"
              title="Transação encontrada!"
              message={transactionResult.id}
              color="orange"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 rounded-xl p-3">
                <p className="text-zinc-500 text-xs mb-1">Status</p>
                <StatusBadge status={transactionResult.status} />
              </div>
              <InfoCard label="Tipo" value={transactionResult.type} valueClassName="capitalize" />
              <InfoCard label="Método" value={transactionResult.paymentMethod.toUpperCase()} />
              <InfoCard label="Valor" value={formatCurrency(transactionResult.amount, transactionResult.currency)} />
              {transactionResult.description && (
                <InfoCard label="Descrição" value={transactionResult.description} colSpan={2} />
              )}
              <InfoCard
                label="Criado em"
                value={formatDatePtBR(transactionResult.createdAt)}
                valueClassName="text-sm"
              />
              {transactionResult.paidAt && (
                <InfoCard
                  label="Pago em"
                  value={formatDatePtBR(transactionResult.paidAt)}
                  valueClassName="text-sm"
                />
              )}
              {transactionResult.customerId && (
                <InfoCard label="Customer ID" value={transactionResult.customerId} colSpan={2} valueClassName="text-sm font-mono" />
              )}
              {transactionResult.projectId && (
                <InfoCard label="Project ID" value={transactionResult.projectId} colSpan={2} valueClassName="text-sm font-mono" />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <div className="w-16 h-16 mb-4 opacity-50">
              <SearchIcon />
            </div>
            <p>Informe o ID para buscar a transação</p>
          </div>
        )}
      </Card>
    </div>
  );
}
