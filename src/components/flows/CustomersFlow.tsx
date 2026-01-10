import { useState, useEffect } from 'react';
import type { Customer, Project } from '@pague-dev/sdk-node';
import { Card, FormHeader, SectionBox, Input, Button, Alert, Spinner, UserIcon, UserPlaceholder } from '../ui';
import { ProjectSelector } from '../selectors';

interface CustomersFlowProps {
  apiKey: string;
  customers: Customer[];
  loadingCustomers: boolean;
  projects: Project[];
  loadingProjects: boolean;
  loading: boolean;
  error: string | null;
  customerCreated: Customer | null;
  onSubmit: (formData: FormData) => void;
  onRefresh: () => void;
  onSearch: (search: string) => void;
  onCreateProject: (formData: FormData) => void;
}

export function CustomersFlow({
  apiKey,
  customers,
  loadingCustomers,
  projects,
  loadingProjects,
  loading,
  error,
  customerCreated,
  onSubmit,
  onRefresh,
  onSearch,
  onCreateProject,
}: CustomersFlowProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const canSubmit = apiKey && selectedProjectId;

  // Debounce search API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (apiKey) {
        onSearch(searchTerm);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, apiKey, onSearch]);

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
        <FormHeader icon={<UserIcon />} title="Criar Cliente" color="purple" />

        <SectionBox title="Selecione ou crie um projeto:">
          <ProjectSelector
            projects={projects}
            loading={loadingProjects}
            name="customerSelectedProject"
            color="purple"
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
          <Input name="name" label="Nome" required placeholder="Nome completo" color="purple" />
          <Input name="document" label="CPF/CNPJ" required placeholder="Somente números" color="purple" />
          <Input name="email" label="Email (opcional)" type="email" placeholder="email@exemplo.com" color="purple" />
          <Input name="phone" label="Telefone (opcional)" placeholder="+5511999999999" color="purple" />

          <Button
            type="submit"
            color="purple"
            loading={loading}
            loadingText="Criando..."
            disabled={!canSubmit}
          >
            Criar Cliente
          </Button>
        </form>

        {customerCreated && (
          <div className="mt-6">
            <Alert
              type="success"
              title="Cliente criado com sucesso!"
              message={`ID: ${customerCreated.id}\nNome: ${customerCreated.name}`}
              color="purple"
            />
          </div>
        )}

        {error && (
          <div className="mt-6">
            <Alert type="error" title="Erro na requisição" message={error} />
          </div>
        )}
      </Card>

      {/* Customer List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Clientes Cadastrados</h2>
          <button
            onClick={onRefresh}
            disabled={loadingCustomers || !apiKey}
            className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loadingCustomers ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>

        {apiKey && (
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, CPF, email ou telefone..."
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
        )}

        {loadingCustomers ? (
          <div className="flex items-center justify-center h-64 text-zinc-500">
            <Spinner size="lg" />
          </div>
        ) : customers.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">{customer.name}</p>
                    <p className="text-zinc-400 text-sm">{customer.documentType?.toUpperCase()}: {customer.document}</p>
                    {customer.email && <p className="text-zinc-500 text-sm">{customer.email}</p>}
                    {customer.phone && <p className="text-zinc-500 text-sm">{customer.phone}</p>}
                  </div>
                  <span className="text-xs text-zinc-600 font-mono">{customer.id.slice(0, 8)}...</span>
                </div>
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="flex flex-col items-center justify-center h-32 text-zinc-500">
            <p>Nenhum cliente encontrado para "{searchTerm}"</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <div className="w-16 h-16 mb-4 opacity-50">
              <UserPlaceholder />
            </div>
            <p>Nenhum cliente cadastrado</p>
          </div>
        )}
      </Card>
    </div>
  );
}
