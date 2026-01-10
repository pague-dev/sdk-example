import type { Transaction } from '@pague-dev/sdk-node';
import { Card, FormHeader, Button, Alert, InfoCard, ClipboardIcon, SearchIcon } from '../ui';
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

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-400';
    case 'pending':
      return 'text-yellow-400';
    case 'failed':
      return 'text-red-400';
    default:
      return 'text-zinc-400';
  }
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
        <FormHeader icon={<ClipboardIcon />} title="Buscar Transacao" color="orange" />

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">ID da Transacao</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Digite o ID da transacao (UUID)"
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
            Buscar Transacao
          </Button>
        </div>

        {error && (
          <div className="mt-6">
            <Alert type="error" title="Erro na requisicao" message={error} />
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
              title="Transacao encontrada!"
              message={transactionResult.id}
              color="orange"
            />

            <div className="grid grid-cols-2 gap-4">
              <InfoCard
                label="Status"
                value={transactionResult.status}
                valueClassName={`capitalize ${getStatusColor(transactionResult.status)}`}
              />
              <InfoCard label="Tipo" value={transactionResult.type} valueClassName="capitalize" />
              <InfoCard label="Metodo" value={transactionResult.paymentMethod.toUpperCase()} />
              <InfoCard label="Valor" value={formatCurrency(transactionResult.amount, transactionResult.currency)} />
              {transactionResult.description && (
                <InfoCard label="Descricao" value={transactionResult.description} colSpan={2} />
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
            <p>Informe o ID para buscar a transacao</p>
          </div>
        )}
      </Card>
    </div>
  );
}
