import { useState } from 'react';
import type { Withdrawal } from '@pague-dev/sdk-node';
import { Card, FormHeader, Input, CurrencyInput, Select, Button, Alert, InfoCard, EmptyState, ToggleGroup } from '../ui';
import { WithdrawalIcon, WithdrawalPlaceholder, WarningIcon } from '../ui/icons';
import { formatCurrency, formatDatePtBR } from '@/lib/format';

type WithdrawalMode = 'inline' | 'bankAccount';

interface WithdrawalsFlowProps {
  loading: boolean;
  error: string | null;
  withdrawalResult: Withdrawal | null;
  onSubmit: (formData: FormData) => void;
}

export function WithdrawalsFlow({
  loading,
  error,
  withdrawalResult,
  onSubmit,
}: WithdrawalsFlowProps) {
  const [mode, setMode] = useState<WithdrawalMode>('inline');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <Card>
        <FormHeader icon={<WithdrawalIcon />} title="Criar Saque PIX" color="orange" />

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-2">Modo de envio</label>
          <ToggleGroup
            options={[
              { value: 'inline', label: 'PIX Avulso' },
              { value: 'bankAccount', label: 'Conta Salva' },
            ]}
            value={mode}
            onChange={(v) => setMode(v as WithdrawalMode)}
            color="orange"
          />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            onSubmit(formData);
          }}
          className="space-y-5"
        >
          <CurrencyInput name="amount" label="Valor" defaultValue={50} required color="orange" />

          {mode === 'inline' ? (
            <>
              <Input name="pixKey" label="Chave PIX" required defaultValue="12345678901" color="orange" />
              <Select
                name="pixKeyType"
                label="Tipo da Chave"
                defaultValue="cpf"
                color="orange"
                options={[
                  { value: 'cpf', label: 'CPF' },
                  { value: 'cnpj', label: 'CNPJ' },
                  { value: 'email', label: 'E-mail' },
                  { value: 'phone', label: 'Telefone' },
                  { value: 'random', label: 'Aleatória' },
                ]}
              />
              <Input name="holderName" label="Nome do Titular" required defaultValue="João da Silva" color="orange" />
              <Input name="holderDocument" label="CPF/CNPJ do Titular" required defaultValue="12345678901" color="orange" />
            </>
          ) : (
            <Input name="bankAccountId" label="ID da Conta Bancária" required placeholder="UUID da conta PIX salva" color="orange" />
          )}

          <Input
            name="externalReference"
            label="Referência externa (opcional)"
            placeholder="saque-empresa-001"
            color="orange"
          />

          <Button
            type="submit"
            color="orange"
            loading={loading}
            loadingText="Criando saque..."
          >
            Criar Saque
          </Button>
        </form>
      </Card>

      {/* Result */}
      <Card>
        <h2 className="text-2xl font-bold mb-6">Resultado</h2>

        {error && <Alert type="error" title="Erro na requisição" message={error} className="mb-4" />}

        {withdrawalResult ? (
          <div className="space-y-6">
            <Alert type="success" title="Saque criado com sucesso!" message={`ID: ${withdrawalResult.id}`} />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoCard label="Valor" value={formatCurrency(withdrawalResult.amount)} valueClassName="text-xl" />
              <InfoCard label="Status" value={withdrawalResult.status} />
              <InfoCard label="Taxa" value={formatCurrency(withdrawalResult.feeAmount)} />
              <InfoCard label="Líquido" value={formatCurrency(withdrawalResult.netAmount)} />
              {withdrawalResult.snapshotPixKey && (
                <InfoCard label="Chave PIX" value={withdrawalResult.snapshotPixKey} colSpan={2} />
              )}
              {withdrawalResult.snapshotHolderName && (
                <InfoCard label="Titular" value={withdrawalResult.snapshotHolderName} colSpan={2} />
              )}
              {withdrawalResult.processedAt && (
                <InfoCard label="Processado em" value={formatDatePtBR(withdrawalResult.processedAt)} colSpan={2} />
              )}
              {withdrawalResult.externalReference && (
                <InfoCard label="Referência externa" value={withdrawalResult.externalReference} colSpan={2} valueClassName="text-sm font-mono" />
              )}
              {withdrawalResult.failureReason && (
                <InfoCard label="Motivo da falha" value={withdrawalResult.failureReason} colSpan={2} />
              )}
            </div>

            <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-xl text-sm">
              <div className="text-amber-500 mt-0.5">
                <WarningIcon />
              </div>
              <p className="text-zinc-400">
                Em <span className="text-amber-400 font-medium">sandbox</span>, saques são aprovados automaticamente.
                Em produção, o status depende do processamento PIX Out.
              </p>
            </div>
          </div>
        ) : (
          <EmptyState icon={<WithdrawalPlaceholder />} message="Preencha o formulário para criar um saque" />
        )}
      </Card>
    </div>
  );
}
