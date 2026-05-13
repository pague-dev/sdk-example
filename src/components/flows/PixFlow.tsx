import { useEffect, useState } from 'react';
import type { Customer, PixCharge, Project } from '@pague-dev/sdk-node';
import {
  Alert,
  Button,
  Card,
  CopyButton,
  CurrencyInput,
  EmptyState,
  FormHeader,
  InfoCard,
  Input,
  PixIcon,
  QrCodePlaceholder,
  SectionBox,
  Select,
  WarningIcon,
} from '../ui';
import { CustomerSelector, ProjectSelector } from '../selectors';
import { formatCurrency, formatDatePtBR } from '@/lib/format';

interface PixFlowProps {
  apiKey: string;
  projects: Project[];
  loadingProjects: boolean;
  customers: Customer[];
  loadingCustomers: boolean;
  useExistingCustomer: boolean;
  setUseExistingCustomer: (value: boolean) => void;
  loading: boolean;
  error: string | null;
  pixResult: PixCharge | null;
  onSubmit: (formData: FormData) => void;
  onCreateProject: (formData: FormData) => void;
  onViewTransaction?: (transactionId: string) => void;
}

export function PixFlow({
  apiKey,
  projects,
  loadingProjects,
  customers,
  loadingCustomers,
  useExistingCustomer,
  setUseExistingCustomer,
  loading,
  error,
  pixResult,
  onSubmit,
  onCreateProject,
  onViewTransaction,
}: PixFlowProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [includePayer, setIncludePayer] = useState(true);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const canSubmit =
    !!apiKey &&
    !!selectedProjectId &&
    (!includePayer || !useExistingCustomer || customers.length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <FormHeader icon={<PixIcon />} title="Criar QR Code PIX" color="emerald" />

        <SectionBox title="Selecione ou crie um projeto:">
          <ProjectSelector
            projects={projects}
            loading={loadingProjects}
            name="pixSelectedProject"
            color="emerald"
            onCreateProject={onCreateProject}
            createLoading={loading}
            apiKey={apiKey}
            selectedId={selectedProjectId}
            onSelect={setSelectedProjectId}
          />
        </SectionBox>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            if (selectedProjectId) {
              formData.set('projectId', selectedProjectId);
            }
            onSubmit(formData);
          }}
          className="space-y-5"
        >
          <CurrencyInput name="amount" label="Valor" defaultValue={100} required color="emerald" />

          <Input name="description" label="Descrição" defaultValue="Pagamento via PIX" color="emerald" />

          <Input
            name="externalReference"
            label="Referência externa (opcional)"
            placeholder="pedido-12345"
            color="emerald"
          />

          <Select
            name="expiresIn"
            label="Expira em"
            defaultValue="3600"
            color="emerald"
            options={[
              { value: '900', label: '15 minutos' },
              { value: '1800', label: '30 minutos' },
              { value: '3600', label: '1 hora' },
              { value: '86400', label: '24 horas' },
            ]}
          />

          <SectionBox title="Pagador (opcional)">
            <label className="flex items-center gap-3 text-sm text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                name="includePayer"
                checked={includePayer}
                onChange={(e) => setIncludePayer(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
              />
              <span>
                Identificar pagador
                <span className="text-zinc-500 ml-1">
                  (sem marcar, gera QR estático)
                </span>
              </span>
            </label>

            {includePayer && (
              <div className="mt-4">
                <CustomerSelector
                  customers={customers}
                  loading={loadingCustomers}
                  name="pixSelectedCustomer"
                  color="emerald"
                  useExisting={useExistingCustomer}
                  onToggle={setUseExistingCustomer}
                />
                {!useExistingCustomer && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Input
                      name="customerName"
                      label="Nome do Cliente"
                      required
                      defaultValue="João da Silva"
                      color="emerald"
                    />
                    <Input
                      name="customerDocument"
                      label="CPF"
                      required
                      defaultValue="12345678909"
                      color="emerald"
                    />
                  </div>
                )}
              </div>
            )}
          </SectionBox>

          <Button
            type="submit"
            color="emerald"
            loading={loading}
            loadingText="Gerando PIX..."
            disabled={!canSubmit}
          >
            Gerar QR Code PIX
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold mb-6">Resultado</h2>

        {error && <Alert type="error" title="Erro na requisição" message={error} className="mb-4" />}

        {pixResult ? (
          <div className="space-y-6">
            <Alert
              type="success"
              title={pixResult.customerId ? 'PIX criado com sucesso!' : 'QR Code estático criado!'}
              message={`ID: ${pixResult.id}`}
            />

            {pixResult.qrCodeBase64 && (
              <div className="flex justify-center">
                <img
                  src={pixResult.qrCodeBase64}
                  alt="QR Code PIX"
                  className="w-[200px] h-[200px] rounded-xl border border-zinc-700 bg-white p-2"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">PIX Copia e Cola</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={pixResult.pixCopyPaste}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 pr-24 text-zinc-300 text-sm font-mono"
                />
                <CopyButton
                  text={pixResult.pixCopyPaste}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoCard label="Valor" value={formatCurrency(pixResult.amount)} valueClassName="text-xl" />
              <InfoCard label="Status" value={pixResult.status} valueClassName="text-xl capitalize" />
              <InfoCard label="Expira em" value={formatDatePtBR(pixResult.expiresAt)} colSpan={2} />
              {pixResult.externalReference && (
                <InfoCard label="Ref. Externa" value={pixResult.externalReference} colSpan={2} />
              )}
              {pixResult.customerId && (
                <InfoCard
                  label="Customer ID"
                  value={pixResult.customerId}
                  colSpan={2}
                  valueClassName="text-sm font-mono"
                />
              )}
            </div>

            {onViewTransaction && (
              <button
                type="button"
                onClick={() => onViewTransaction(pixResult.id)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Ver Transação
              </button>
            )}

            <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-xl text-sm">
              <div className="text-amber-500 mt-0.5">
                <WarningIcon />
              </div>
              <p className="text-zinc-400">
                Configure um <span className="text-amber-400 font-medium">Webhook</span> para receber confirmações de pagamento.
                <span className="text-zinc-500 ml-1">Evite polling.</span>
              </p>
            </div>
          </div>
        ) : (
          <EmptyState icon={<QrCodePlaceholder />} message="Preencha o formulário para gerar o PIX" />
        )}
      </Card>
    </div>
  );
}
