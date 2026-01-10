import { useState, useEffect } from 'react';
import type { PixCharge, Project, Customer } from '@pague-dev/sdk-node';
import { Card, FormHeader, SectionBox, Input, CurrencyInput, Select, Button, Alert, InfoCard, EmptyState, CopyButton, PixIcon, QrCodePlaceholder, WarningIcon } from '../ui';
import { ProjectSelector, CustomerSelector } from '../selectors';
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
  const canSubmit = apiKey && selectedProjectId && (!useExistingCustomer || customers.length > 0);

  // Auto-select first project when list loads
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <Card>
        <FormHeader icon={<PixIcon />} title="Criar Cobrança PIX" color="emerald" />

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

        <SectionBox title="Dados do Cliente:">
          <CustomerSelector
            customers={customers}
            loading={loadingCustomers}
            name="pixSelectedCustomer"
            color="emerald"
            useExisting={useExistingCustomer}
            onToggle={setUseExistingCustomer}
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

          {!useExistingCustomer && (
            <div className="grid grid-cols-2 gap-4">
              <Input name="customerName" label="Nome do Cliente" required defaultValue="João da Silva" color="emerald" />
              <Input name="customerDocument" label="CPF" required defaultValue="12345678909" color="emerald" />
            </div>
          )}

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

      {/* Result */}
      <Card>
        <h2 className="text-2xl font-bold mb-6">Resultado</h2>

        {error && <Alert type="error" title="Erro na requisição" message={error} className="mb-4" />}

        {pixResult ? (
          <div className="space-y-6">
            <Alert type="success" title="PIX criado com sucesso!" message={`ID: ${pixResult.id}`} />

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

            {/* Webhook Disclaimer */}
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
