import { useState } from 'react';
import type { RequestRefund, Transaction } from '@pague-dev/sdk-node';
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
  onRefund?: (id: string, reason: string) => Promise<RequestRefund | null>;
}

export function TransactionsFlow({
  apiKey,
  transactionId,
  setTransactionId,
  loading,
  error,
  transactionResult,
  onSearch,
  onRefund,
}: TransactionsFlowProps) {
  const canSearch = apiKey && transactionId.trim();
  const [refundReason, setRefundReason] = useState('');
  const [refundResult, setRefundResult] = useState<RequestRefund | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const canRefund =
    !!onRefund &&
    transactionResult?.type === 'payment' &&
    transactionResult?.status === 'completed';

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

            {canRefund && (
              <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl space-y-3">
                <h3 className="font-semibold">Solicitar reembolso</h3>
                <p className="text-xs text-zinc-500">
                  Reembolso é assíncrono — a confirmação chega via webhook <code>refund_completed</code>.
                  Requer permissão <code>REFUND:WRITE</code> na chave de API.
                </p>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Motivo (opcional, máx 255 chars)"
                  maxLength={255}
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
                <Button
                  type="button"
                  color="orange"
                  loading={refunding}
                  loadingText="Solicitando..."
                  disabled={!onRefund}
                  onClick={async () => {
                    if (!onRefund) return;
                    setRefunding(true);
                    setRefundError(null);
                    setRefundResult(null);
                    try {
                      const r = await onRefund(transactionResult.id, refundReason);
                      if (r) setRefundResult(r);
                    } catch (err) {
                      setRefundError(err instanceof Error ? err.message : String(err));
                    } finally {
                      setRefunding(false);
                    }
                  }}
                >
                  Solicitar reembolso
                </Button>
                {refundError && <Alert type="error" title="Erro no reembolso" message={refundError} />}
                {refundResult && (
                  <Alert
                    type="success"
                    title={`Reembolso ${refundResult.status}`}
                    message={`PSP ${refundResult.pspProvider} • ID ${refundResult.pspRefundTransactionId}`}
                  />
                )}
              </div>
            )}
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
