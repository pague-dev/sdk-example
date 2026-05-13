import { useState, useEffect, useCallback } from 'react';
import {
  createPixCharge,
  createStaticQrCode,
  createCharge,
  createProject,
  listProjects,
  createCustomer,
  listCustomers,
  getTransaction,
  refundTransaction,
  listCharges,
  getCharge,
  createWithdrawal,
  getAccountInfo,
} from './lib/api';
import type { PixCharge, StaticQrCode, Charge, Project, Customer, Transaction, Withdrawal, AccountInfo } from '@pague-dev/sdk-node';
import { TabButton } from '@/components/ui';
import { formatApiError } from '@/lib/error-messages';
import { PixFlow, PaymentLinkFlow, CustomersFlow, TransactionsFlow, WithdrawalsFlow, WebhooksFlow, AccountFlow } from '@/components/flows';

type FlowType = 'pix' | 'payment-link' | 'customers' | 'withdrawals' | 'transactions' | 'account' | 'webhooks';

const flowDescriptions: Record<FlowType, string> = {
  pix: 'Gere QR Codes dinâmicos ou estáticos',
  'payment-link': 'Crie links de pagamento compartilháveis',
  customers: 'Gerencie sua base de clientes',
  withdrawals: 'Realize saques via PIX',
  transactions: 'Consulte transações por ID',
  account: 'Consulte dados da conta e saldo',
  webhooks: 'Configure notificações em tempo real',
};

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
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
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loadingCharges, setLoadingCharges] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [loadingSelectedCharge, setLoadingSelectedCharge] = useState(false);
  const [withdrawalResult, setWithdrawalResult] = useState<Withdrawal | null>(null);
  const [accountResult, setAccountResult] = useState<AccountInfo | null>(null);
  const [pixMode, setPixMode] = useState<'dynamic' | 'static'>('dynamic');
  const [staticQrCodeResult, setStaticQrCodeResult] = useState<StaticQrCode | null>(null);

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

  const loadChargesList = useCallback(async (key: string) => {
    setLoadingCharges(true);
    const result = await listCharges(key, 1, 100);
    if (result.data) setCharges(result.data.items);
    setLoadingCharges(false);
  }, []);

  async function handleGetCharge(id: string) {
    if (!apiKey) return;
    setLoadingSelectedCharge(true);
    const result = await getCharge(apiKey, id);
    if (result.data) setSelectedCharge(result.data as Charge);
    setLoadingSelectedCharge(false);
  }

  async function validateApiKey(key: string) {
    if (!key.trim()) {
      setApiKeyError('Informe a API Key');
      return;
    }

    setIsValidating(true);
    setApiKeyError(null);
    setIsApiKeyValid(false);

    const result = await listProjects(key, 1, 1);

    if (result.data) {
      // Sucesso - API key válida
      setIsApiKeyValid(true);
      setApiKeyError(null);
      localStorage.setItem('pdev_api_key', key);
      loadProjects(key);
      loadCustomers(key);
      loadChargesList(key);
    } else if (result.error) {
      // Erro - API key inválida ou outro erro
      const { statusCode, message } = result.error;
      if (statusCode === 401 || statusCode === 403) {
        setApiKeyError('API Key inválida. Verifique sua chave.');
      } else if (statusCode === null) {
        setApiKeyError('Erro de conexão. Verifique sua internet.');
      } else {
        setApiKeyError(message || 'Erro ao validar API Key.');
      }
      setIsApiKeyValid(false);
      setProjects([]);
      setCustomers([]);
      setCharges([]);
    }

    setIsValidating(false);
  }

  function handleApiKeyInputChange(value: string) {
    setApiKey(value);
    // Reseta validação quando muda a key
    if (isApiKeyValid) {
      setIsApiKeyValid(false);
      setProjects([]);
      setCustomers([]);
      setCharges([]);
    }
    setApiKeyError(null);
  }

  function handleLogout() {
    setApiKey('');
    setIsApiKeyValid(false);
    setApiKeyError(null);
    setProjects([]);
    setCustomers([]);
    setCharges([]);
    localStorage.removeItem('pdev_api_key');
  }

  useEffect(() => {
    const savedKey = localStorage.getItem('pdev_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      // Valida a key salva automaticamente
      validateApiKey(savedKey);
    }
  }, []);


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

  async function handleCreateStaticQrCode(formData: FormData) {
    if (!apiKey) {
      setError('Informe a API Key primeiro');
      return;
    }
    setLoading(true);
    setError(null);
    setStaticQrCodeResult(null);

    const result = await createStaticQrCode(apiKey, formData);
    if (result.error) setError(formatApiError(result.error));
    else if (result.data) setStaticQrCodeResult(result.data as StaticQrCode);
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
    else if (result.data) {
      setChargeResult(result.data as Charge);
      await loadChargesList(apiKey);
    }
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

  async function handleCreateWithdrawal(formData: FormData) {
    if (!apiKey) {
      setError('Informe a API Key primeiro');
      return;
    }
    setLoading(true);
    setError(null);
    setWithdrawalResult(null);

    const result = await createWithdrawal(apiKey, formData);
    if (result.error) setError(formatApiError(result.error));
    else if (result.data) setWithdrawalResult(result.data as Withdrawal);
    setLoading(false);
  }

  async function handleGetAccount() {
    if (!apiKey) {
      setError('Informe a API Key primeiro');
      return;
    }
    setLoading(true);
    setError(null);
    setAccountResult(null);

    const result = await getAccountInfo(apiKey);
    if (result.error) setError(formatApiError(result.error));
    else if (result.data) setAccountResult(result.data as AccountInfo);
    setLoading(false);
  }

  async function handleGetTransaction() {
    if (!apiKey) {
      setError('Informe a API Key primeiro');
      return;
    }
    if (!transactionId.trim()) {
      setError('Informe o ID da transação');
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
    setStaticQrCodeResult(null);
    setChargeResult(null);
    setTransactionResult(null);
    setCustomerCreated(null);
    setSelectedCharge(null);
    setWithdrawalResult(null);
    setAccountResult(null);
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
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://pague.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              pague.dev
            </a>
            <a
              href="https://docs.pague.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Documentação
            </a>
            <a
              href="https://github.com/pague-dev/sdk-example"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>

        {/* API Key Input */}
        <div className={`bg-zinc-900/50 backdrop-blur rounded-2xl p-6 border mb-8 transition-colors ${
          isApiKeyValid ? 'border-emerald-700/50' : apiKeyError ? 'border-red-700/50' : 'border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isApiKeyValid ? 'bg-emerald-600' : 'bg-violet-600'
              }`}>
                {isApiKeyValid ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="font-semibold">API Key</h2>
                <p className="text-zinc-500 text-sm">
                  {isApiKeyValid ? 'Conectado com sucesso' : 'Sua chave será salva localmente no navegador'}
                </p>
              </div>
            </div>
            {isApiKeyValid && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-zinc-400 hover:text-red-400 text-sm font-medium transition-colors"
              >
                Desconectar
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => handleApiKeyInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isApiKeyValid && validateApiKey(apiKey)}
                placeholder="pd_test_sua_chave_aqui"
                disabled={isApiKeyValid}
                className={`w-full bg-zinc-800/50 border rounded-xl px-4 py-3 pr-40 text-white font-mono text-sm transition-all ${
                  isApiKeyValid
                    ? 'border-emerald-700/50 opacity-75'
                    : apiKeyError
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-zinc-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500'
                }`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {!isApiKeyValid && (
                  <button
                    type="button"
                    onClick={async () => {
                      const text = await navigator.clipboard.readText();
                      if (text) handleApiKeyInputChange(text);
                    }}
                    className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    title="Colar do clipboard"
                  >
                    Colar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  {showApiKey ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {!isApiKeyValid && (
              <button
                type="button"
                onClick={() => validateApiKey(apiKey)}
                disabled={isValidating || !apiKey.trim()}
                className="bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isValidating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Validando...
                  </>
                ) : (
                  'Validar'
                )}
              </button>
            )}
          </div>

          {/* Status Messages */}
          {!apiKey && !apiKeyError && (
            <p className="text-amber-400 text-sm mt-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Informe e valide sua API Key para testar os endpoints
            </p>
          )}

          {apiKeyError && (
            <p className="text-red-400 text-sm mt-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {apiKeyError}
            </p>
          )}

          {isApiKeyValid && (
            <p className="text-emerald-400 text-sm mt-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              API Key válida - você pode usar todos os endpoints
            </p>
          )}

          {/* Disclaimer */}
          <p className="text-zinc-500 text-xs mt-4 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recomendamos utilizar sua API Key de teste (pd_test_...). Transações de teste são aprovadas em instantes.
          </p>
        </div>

        {/* Flow Selection */}
        <div className={`text-center mb-10 ${!isApiKeyValid ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <TabButton active={activeFlow === 'pix'} color="emerald" onClick={() => { setActiveFlow('pix'); clearResults(); }}>
              PIX
            </TabButton>
            <TabButton active={activeFlow === 'payment-link'} color="blue" onClick={() => { setActiveFlow('payment-link'); clearResults(); }}>
              Link de Pagamento
            </TabButton>
            <TabButton active={activeFlow === 'customers'} color="purple" onClick={() => { setActiveFlow('customers'); clearResults(); }}>
              Clientes
            </TabButton>
            <TabButton active={activeFlow === 'withdrawals'} color="orange" onClick={() => { setActiveFlow('withdrawals'); clearResults(); }}>
              Saques
            </TabButton>
            <TabButton active={activeFlow === 'transactions'} color="orange" onClick={() => { setActiveFlow('transactions'); clearResults(); }}>
              Transações
            </TabButton>
            <TabButton active={activeFlow === 'account'} color="violet" onClick={() => { setActiveFlow('account'); clearResults(); }}>
              Conta
            </TabButton>
            <TabButton active={activeFlow === 'webhooks'} color="violet" onClick={() => { setActiveFlow('webhooks'); clearResults(); }}>
              Webhooks
            </TabButton>
          </div>
          <p className="text-zinc-400 text-sm">{flowDescriptions[activeFlow]}</p>
        </div>

        {/* Blocked State */}
        {!isApiKeyValid && (
          <div className="bg-zinc-900/50 backdrop-blur rounded-2xl p-12 border border-zinc-800 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Comece por aqui</h3>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              Insira sua API Key acima e clique em validar para começar a testar os endpoints.
            </p>
          </div>
        )}

        {/* Flows */}
        {isApiKeyValid && activeFlow === 'pix' && (
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
            pixMode={pixMode}
            setPixMode={setPixMode}
            staticQrCodeResult={staticQrCodeResult}
            onSubmitStatic={handleCreateStaticQrCode}
          />
        )}

        {isApiKeyValid && activeFlow === 'payment-link' && (
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
            onCloseResult={() => setChargeResult(null)}
            charges={charges}
            loadingCharges={loadingCharges}
            selectedCharge={selectedCharge}
            loadingSelectedCharge={loadingSelectedCharge}
            onRefreshCharges={() => loadChargesList(apiKey)}
            onSelectCharge={handleGetCharge}
          />
        )}

        {isApiKeyValid && activeFlow === 'customers' && (
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

        {isApiKeyValid && activeFlow === 'withdrawals' && (
          <WithdrawalsFlow
            loading={loading}
            error={error}
            withdrawalResult={withdrawalResult}
            onSubmit={handleCreateWithdrawal}
          />
        )}

        {isApiKeyValid && activeFlow === 'transactions' && (
          <TransactionsFlow
            apiKey={apiKey}
            transactionId={transactionId}
            setTransactionId={setTransactionId}
            loading={loading}
            error={error}
            transactionResult={transactionResult}
            onSearch={handleGetTransaction}
            onRefund={async (id, reason) => {
              const r = await refundTransaction(apiKey, id, reason || undefined);
              if (r.error) throw new Error(formatApiError(r.error));
              return r.data ?? null;
            }}
          />
        )}

        {isApiKeyValid && activeFlow === 'account' && (
          <AccountFlow
            loading={loading}
            error={error}
            accountResult={accountResult}
            onFetch={handleGetAccount}
          />
        )}

        {isApiKeyValid && activeFlow === 'webhooks' && <WebhooksFlow />}
      </div>
    </div>
  );
}
