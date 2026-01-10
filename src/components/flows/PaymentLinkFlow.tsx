import { useState, useEffect } from 'react';
import type { Charge, Project, Customer } from '@pague-dev/sdk-node';
import { Card, FormHeader, SectionBox, Input, CurrencyInput, Button, Alert, InfoCard, EmptyState, CopyButton, LinkIcon, LinkPlaceholder, Spinner, StatusBadge, Dialog } from '../ui';
import { ProjectSelector, CustomerSelector } from '../selectors';
import { formatCurrency } from '@/lib/format';

interface PaymentLinkFlowProps {
  apiKey: string;
  projects: Project[];
  loadingProjects: boolean;
  customers: Customer[];
  loadingCustomers: boolean;
  useExistingCustomer: boolean;
  setUseExistingCustomer: (value: boolean) => void;
  loading: boolean;
  error: string | null;
  chargeResult: Charge | null;
  onSubmit: (formData: FormData) => void;
  onCreateProject: (formData: FormData) => void;
  onCloseResult: () => void;
  charges: Charge[];
  loadingCharges: boolean;
  selectedCharge: Charge | null;
  onRefreshCharges: () => void;
  onSelectCharge: (id: string) => void;
}

export function PaymentLinkFlow({
  apiKey,
  projects,
  loadingProjects,
  customers,
  loadingCustomers,
  useExistingCustomer,
  setUseExistingCustomer,
  loading,
  error,
  chargeResult,
  onSubmit,
  onCreateProject,
  onCloseResult,
  charges,
  loadingCharges,
  selectedCharge,
  onRefreshCharges,
  onSelectCharge,
}: PaymentLinkFlowProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchId, setSearchId] = useState('');
  const canSubmit = apiKey && selectedProjectId;

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
        <FormHeader icon={<LinkIcon />} title="Criar Link de Pagamento" color="blue" />

        <SectionBox title="Primeiro, selecione ou crie um projeto:">
          <ProjectSelector
            projects={projects}
            loading={loadingProjects}
            name="selectedProject"
            color="blue"
            onCreateProject={onCreateProject}
            createLoading={loading}
            apiKey={apiKey}
            selectedId={selectedProjectId}
            onSelect={setSelectedProjectId}
          />
        </SectionBox>

        <SectionBox title="Cliente (opcional):">
          <CustomerSelector
            customers={customers}
            loading={loadingCustomers}
            name="chargeSelectedCustomer"
            color="blue"
            useExisting={useExistingCustomer}
            onToggle={setUseExistingCustomer}
            toggleLabels={{ manual: 'Sem cliente', existing: 'Selecionar cliente' }}
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

          <Input name="name" label="Nome do Produto/Servico" required defaultValue="Produto Premium" color="blue" />
          <Input name="description" label="Descricao" defaultValue="Acesso completo ao conteudo premium" color="blue" />
          <CurrencyInput name="amount" label="Valor" defaultValue={99.9} required color="blue" />

          <Button
            type="submit"
            color="blue"
            loading={loading}
            loadingText="Criando link..."
            disabled={!canSubmit}
          >
            Criar Link de Pagamento
          </Button>
        </form>
      </Card>

      {/* Dialog for created link */}
      <Dialog open={!!chargeResult} onClose={onCloseResult} title="Link Criado com Sucesso!">
        {chargeResult && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-500/30">
              <p className="text-zinc-400 text-sm mb-2">Link de pagamento:</p>
              <a
                href={chargeResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-lg font-medium break-all underline underline-offset-4"
              >
                {chargeResult.url}
              </a>
              <CopyButton
                text={chargeResult.url}
                label="Copiar Link"
                variant="primary"
                color="blue"
                className="mt-4"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoCard label="Nome" value={chargeResult.name} />
              <InfoCard label="Valor" value={formatCurrency(chargeResult.amount)} valueClassName="text-xl" />
              <InfoCard label="Status" value={chargeResult.status} valueClassName="capitalize" />
              <InfoCard label="Metodos" value={chargeResult.paymentMethods.join(', ').toUpperCase()} />
              <InfoCard label="Slug" value={chargeResult.slug} colSpan={2} />
            </div>
          </div>
        )}
      </Dialog>

      {/* Charges List */}
      <Card>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Charges Criados</h2>
              <button
                onClick={onRefreshCharges}
                className="text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-800"
                title="Atualizar lista"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {error && <Alert type="error" title="Erro na requisicao" message={error} className="mb-4" />}

            {/* Search by ID */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Buscar por ID..."
                className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                onClick={() => searchId && onSelectCharge(searchId)}
                disabled={!searchId}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Buscar
              </button>
            </div>

            {/* Selected Charge Details */}
            {selectedCharge && (
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{selectedCharge.name}</h3>
                  <StatusBadge status={selectedCharge.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoCard label="Valor" value={formatCurrency(selectedCharge.amount)} />
                  <InfoCard label="Metodos" value={selectedCharge.paymentMethods.join(', ').toUpperCase()} />
                  <InfoCard label="ID" value={selectedCharge.id} colSpan={2} />
                </div>
                {selectedCharge.url && (
                  <div className="mt-4">
                    <CopyButton text={selectedCharge.url} label="Copiar Link" variant="primary" color="blue" />
                  </div>
                )}
              </div>
            )}

            {/* Charges List */}
            {loadingCharges ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : charges.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {charges.map((charge) => (
                  <button
                    key={charge.id}
                    onClick={() => onSelectCharge(charge.id)}
                    className={`w-full text-left bg-zinc-800/50 hover:bg-zinc-800 rounded-xl p-4 border transition-all ${
                      selectedCharge?.id === charge.id ? 'border-blue-500' : 'border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{charge.name}</p>
                        <p className="text-zinc-400 text-sm">{formatCurrency(charge.amount)}</p>
                      </div>
                      <StatusBadge status={charge.status} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState icon={<LinkPlaceholder />} message="Nenhum charge criado ainda" />
            )}
          </div>
      </Card>
    </div>
  );
}
