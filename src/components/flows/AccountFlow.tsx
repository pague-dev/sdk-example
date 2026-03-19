import type { AccountInfo } from '@pague-dev/sdk-node';
import { Card, FormHeader, Button, Alert, InfoCard, StatusBadge } from '../ui';
import { formatCurrency, formatDatePtBR } from '@/lib/format';

const AccountIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const AccountPlaceholder = () => (
  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

interface AccountFlowProps {
  loading: boolean;
  error: string | null;
  accountResult: AccountInfo | null;
  onFetch: () => void;
}

export function AccountFlow({
  loading,
  error,
  accountResult,
  onFetch,
}: AccountFlowProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Fetch */}
      <Card>
        <FormHeader icon={<AccountIcon />} title="Dados da Conta" color="violet" />

        <div className="space-y-5">
          <p className="text-zinc-400 text-sm">
            Consulte os dados da sua conta, informações da empresa e saldo disponível.
          </p>

          <Button
            type="button"
            color="violet"
            loading={loading}
            loadingText="Consultando..."
            onClick={onFetch}
          >
            Consultar Conta
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

        {accountResult ? (
          <div className="space-y-6">
            <Alert
              type="success"
              title="Dados obtidos com sucesso!"
              message={accountResult.account.id}
            />

            {/* Account */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Conta</h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoCard label="ID" value={accountResult.account.id} valueClassName="text-sm font-mono" />
                <div className="bg-zinc-800/50 rounded-xl p-3">
                  <p className="text-zinc-500 text-xs mb-1">Status</p>
                  <StatusBadge status={accountResult.account.status} />
                </div>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Empresa</h3>
              {accountResult.company ? (
                <div className="grid grid-cols-2 gap-4">
                  <InfoCard label="Razão Social" value={accountResult.company.razaoSocial} colSpan={2} />
                  {accountResult.company.nomeFantasia && (
                    <InfoCard label="Nome Fantasia" value={accountResult.company.nomeFantasia} colSpan={2} />
                  )}
                  <InfoCard label="CNPJ" value={accountResult.company.cnpj} valueClassName="font-mono" />
                  <div className="bg-zinc-800/50 rounded-xl p-3">
                    <p className="text-zinc-500 text-xs mb-1">Status</p>
                    <StatusBadge status={accountResult.company.status} />
                  </div>
                  <InfoCard label="Email" value={accountResult.company.email} />
                  <InfoCard label="Telefone" value={accountResult.company.phone} />
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">Nenhuma empresa cadastrada.</p>
              )}
            </div>

            {/* Balance */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Saldo</h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoCard
                  label="Disponível"
                  value={formatCurrency(accountResult.balance.available.amountFormatted, accountResult.balance.currency)}
                />
                <InfoCard
                  label="Promocional"
                  value={formatCurrency(accountResult.balance.promotional.amountFormatted, accountResult.balance.currency)}
                />
                <InfoCard
                  label="Bloqueado"
                  value={formatCurrency(accountResult.balance.held.amountFormatted, accountResult.balance.currency)}
                />
                <InfoCard
                  label="Total"
                  value={formatCurrency(accountResult.balance.total.amountFormatted, accountResult.balance.currency)}
                />
                <InfoCard
                  label="Atualizado em"
                  value={formatDatePtBR(accountResult.balance.updatedAt)}
                  valueClassName="text-sm"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <div className="w-16 h-16 mb-4 opacity-50">
              <AccountPlaceholder />
            </div>
            <p>Clique em consultar para ver os dados da conta</p>
          </div>
        )}
      </Card>
    </div>
  );
}
