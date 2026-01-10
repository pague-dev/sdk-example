import { useState, useEffect, useCallback } from 'react';
import {
  createPixCharge,
  createCharge,
  createProject,
  listProjects,
  createCustomer,
  listCustomers,
  getTransaction,
} from './lib/api';
import type { PixCharge, Charge, Project, Customer, Transaction } from '@pague-dev/sdk-node';
import { TabButton } from '@/components/ui';
import { formatApiError } from '@/lib/error-messages';
import { PixFlow, PaymentLinkFlow, CustomersFlow, TransactionsFlow, WebhooksFlow } from '@/components/flows';

type FlowType = 'pix' | 'payment-link' | 'customers' | 'transactions' | 'webhooks';

const flowDescriptions: Record<FlowType, string> = {
  pix: 'Gere QR Codes para pagamentos instantaneos',
  'payment-link': 'Crie links de pagamento compartilhaveis',
  customers: 'Gerencie sua base de clientes',
  transactions: 'Consulte transacoes por ID',
  webhooks: 'Configure notificacoes em tempo real',
};

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeFlow, setActiveFlow] = useState<FlowType>('pix');
  const [loading, setLoading] = useState(false);
  const [pixResult, setPixResult] = useState<PixCharge | null>(null);
  const [chargeResult, setChargeResult] = useState<Charge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [useExistingCustomer, setUseExistingCustomer] = useState(false);
  const [useExistingCustomerCharge, setUseExistingCustomerCharge] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [transactionResult, setTransactionResult] = useState<Transaction | null>(null);
  const [customerCreated, setCustomerCreated] = useState<Customer | null>(null);

  async function loadProjects(key: string) {
    setLoadingProjects(true);
    const result = await listProjects(key, 1, 100);
    if (result.data) setProjects(result.data.items);
    setLoadingProjects(false);
  }

  const loadCustomers = useCallback(async (key: string, search?: string) => {
    setLoadingCustomers(true);
    const result = await listCustomers(key, 1, 100, search);
    if (result.data) setCustomers(result.data.items);
    setLoadingCustomers(false);
  }, []);

  useEffect(() => {
    const savedKey = localStorage.getItem('pdev_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      loadProjects(savedKey);
      loadCustomers(savedKey);
    }
  }, []);

  function handleApiKeyChange(value: string) {
    setApiKey(value);
    localStorage.setItem('pdev_api_key', value);
    if (value) {
      loadProjects(value);
      loadCustomers(value);
    }
  }

  async function handleCreatePix(formData: FormData) {
    if (!apiKey) {
      setError('Informe a API Key primeiro');
      return;
    }
    setLoading(true);
    setError(null);
    setPixResult(null);

    if (useExistingCustomer) {
      const selectedCustomer = document.querySelector('input[name="pixSelectedCustomer"]:checked') as HTMLInputElement;
      if (selectedCustomer) formData.set('customerId', selectedCustomer.value);
    }

    const result = await createPixCharge(apiKey, formData);
    if (result.error) setError(formatApiError(result.error));
    else if (result.data) setPixResult(result.data as PixCharge);
    setLoading(false);
  }

  async function handleCreateCharge(formData: FormData) {
    if (!apiKey) {
      setError('Informe a API Key primeiro');
      return;
    }
    setLoading(true);
    setError(null);
    setChargeResult(null);

    if (useExistingCustomerCharge) {
      const selectedCustomer = document.querySelector('input[name="chargeSelectedCustomer"]:checked') as HTMLInputElement;
      if (selectedCustomer) formData.set('customerId', selectedCustomer.value);
    }

    const result = await createCharge(apiKey, formData);
    if (result.error) setError(formatApiError(result.error));
    else if (result.data) setChargeResult(result.data as Charge);
    setLoading(false);
  }

  async function handleCreateProject(formData: FormData) {
    if (!apiKey) {
      setError('Informe a API Key primeiro');
      return;
    }
    setLoading(true);
    setError(null);

    const result = await createProject(apiKey, formData);
    if (result.error) setError(formatApiError(result.error));
    else if (result.data) await loadProjects(apiKey);
    setLoading(false);
  }

  async function handleCreateCustomer(formData: FormData) {
    if (!apiKey) {
      setError('Informe a API Key primeiro');
      return;
    }
    setLoading(true);
    setError(null);
    setCustomerCreated(null);

    const result = await createCustomer(apiKey, formData);
    if (result.error) setError(formatApiError(result.error));
    else if (result.data) {
      setCustomerCreated(result.data as Customer);
      await loadCustomers(apiKey);
    }
    setLoading(false);
  }

  async function handleGetTransaction() {
    if (!apiKey) {
      setError('Informe a API Key primeiro');
      return;
    }
    if (!transactionId.trim()) {
      setError('Informe o ID da transacao');
      return;
    }
    setLoading(true);
    setError(null);
    setTransactionResult(null);

    const result = await getTransaction(apiKey, transactionId);
    if (result.error) setError(formatApiError(result.error));
    else if (result.data) setTransactionResult(result.data as Transaction);
    setLoading(false);
  }

  function clearResults() {
    setError(null);
    setPixResult(null);
    setChargeResult(null);
    setTransactionResult(null);
    setCustomerCreated(null);
  }

  const handleSearchCustomers = useCallback((search: string) => {
    loadCustomers(apiKey, search);
  }, [apiKey, loadCustomers]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">pague.dev SDK</h1>
          <p className="text-zinc-400 text-lg mb-6">Explore a API de pagamentos</p>
          <a
            href="https://github.com/pague-dev/pdev-sdk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Ver no GitHub
          </a>
        </div>

        {/* API Key Input */}
        <div className="bg-zinc-900/50 backdrop-blur rounded-2xl p-6 border border-zinc-800 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold">API Key</h2>
              <p className="text-zinc-500 text-sm">Sua chave sera salva localmente no navegador</p>
            </div>
          </div>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="pd_test_sua_chave_aqui"
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 pr-24 text-white font-mono text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              {showApiKey ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {!apiKey && (
            <p className="text-amber-400 text-sm mt-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Informe sua API Key para testar os endpoints
            </p>
          )}
        </div>

        {/* Flow Selection */}
        <div className="text-center mb-10">
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <TabButton active={activeFlow === 'pix'} color="emerald" onClick={() => { setActiveFlow('pix'); clearResults(); }}>
              PIX QR Code
            </TabButton>
            <TabButton active={activeFlow === 'payment-link'} color="blue" onClick={() => { setActiveFlow('payment-link'); clearResults(); }}>
              Link de Pagamento
            </TabButton>
            <TabButton active={activeFlow === 'customers'} color="purple" onClick={() => { setActiveFlow('customers'); clearResults(); }}>
              Clientes
            </TabButton>
            <TabButton active={activeFlow === 'transactions'} color="orange" onClick={() => { setActiveFlow('transactions'); clearResults(); }}>
              Transacoes
            </TabButton>
            <TabButton active={activeFlow === 'webhooks'} color="violet" onClick={() => { setActiveFlow('webhooks'); clearResults(); }}>
              Webhooks
            </TabButton>
          </div>
          <p className="text-zinc-400 text-sm">{flowDescriptions[activeFlow]}</p>
        </div>

        {/* Flows */}
        {activeFlow === 'pix' && (
          <PixFlow
            apiKey={apiKey}
            projects={projects}
            loadingProjects={loadingProjects}
            customers={customers}
            loadingCustomers={loadingCustomers}
            useExistingCustomer={useExistingCustomer}
            setUseExistingCustomer={setUseExistingCustomer}
            loading={loading}
            error={error}
            pixResult={pixResult}
            onSubmit={handleCreatePix}
            onCreateProject={handleCreateProject}
            onViewTransaction={(id) => {
              setTransactionId(id);
              setActiveFlow('transactions');
              clearResults();
            }}
          />
        )}

        {activeFlow === 'payment-link' && (
          <PaymentLinkFlow
            apiKey={apiKey}
            projects={projects}
            loadingProjects={loadingProjects}
            customers={customers}
            loadingCustomers={loadingCustomers}
            useExistingCustomer={useExistingCustomerCharge}
            setUseExistingCustomer={setUseExistingCustomerCharge}
            loading={loading}
            error={error}
            chargeResult={chargeResult}
            onSubmit={handleCreateCharge}
            onCreateProject={handleCreateProject}
          />
        )}

        {activeFlow === 'customers' && (
          <CustomersFlow
            apiKey={apiKey}
            customers={customers}
            loadingCustomers={loadingCustomers}
            projects={projects}
            loadingProjects={loadingProjects}
            loading={loading}
            error={error}
            customerCreated={customerCreated}
            onSubmit={handleCreateCustomer}
            onRefresh={() => loadCustomers(apiKey)}
            onSearch={handleSearchCustomers}
            onCreateProject={handleCreateProject}
          />
        )}

        {activeFlow === 'transactions' && (
          <TransactionsFlow
            apiKey={apiKey}
            transactionId={transactionId}
            setTransactionId={setTransactionId}
            loading={loading}
            error={error}
            transactionResult={transactionResult}
            onSearch={handleGetTransaction}
          />
        )}

        {activeFlow === 'webhooks' && <WebhooksFlow />}
      </div>
    </div>
  );
}
