import { useState, useEffect } from 'react';
import type { Charge, Project, Customer } from '@pague-dev/sdk-node';
import { Card, FormHeader, SectionBox, Input, CurrencyInput, Button, Alert, InfoCard, EmptyState, CopyButton, LinkIcon, LinkPlaceholder } from '../ui';
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
}: PaymentLinkFlowProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
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

      {/* Result */}
      <Card>
        <h2 className="text-2xl font-bold mb-6">Resultado</h2>

        {error && <Alert type="error" title="Erro na requisicao" message={error} className="mb-4" />}

        {chargeResult ? (
          <div className="space-y-6">
            <Alert type="success" title="Link criado com sucesso!" message={`ID: ${chargeResult.id}`} color="blue" />

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
        ) : (
          <EmptyState icon={<LinkPlaceholder />} message="Preencha o formulario para criar o link" />
        )}
      </Card>
    </div>
  );
}
