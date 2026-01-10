import { useState } from 'react';
import { Card, FormHeader, CopyButton, WebhookIcon } from '../ui';

type EventType = 'payment_completed' | 'payment_failed' | 'refund_completed';

const eventExamples: Record<EventType, object> = {
  payment_completed: {
    event: 'payment_completed',
    eventId: 'txn_abc123def456',
    timestamp: '2024-01-15T10:30:00.000Z',
    data: {
      transactionId: 'txn_abc123def456',
      amount: 100.5,
      feeAmount: 0.99,
      netAmount: 99.51,
      currency: 'BRL',
      paymentMethod: 'pix',
      status: 'completed',
      completedAt: '2024-01-15T10:30:00.000Z',
    },
  },
  payment_failed: {
    event: 'payment_failed',
    eventId: 'txn_xyz789ghi012',
    timestamp: '2024-01-15T10:35:00.000Z',
    data: {
      transactionId: 'txn_xyz789ghi012',
      amount: 50.0,
      currency: 'BRL',
      paymentMethod: 'pix',
      status: 'failed',
      failedAt: '2024-01-15T10:35:00.000Z',
      failureReason: 'expired',
    },
  },
  refund_completed: {
    event: 'refund_completed',
    eventId: 'txn_ref456jkl789',
    timestamp: '2024-01-15T11:00:00.000Z',
    data: {
      refundTransactionId: 'txn_ref456jkl789',
      originalTransactionId: 'txn_abc123def456',
      amount: 100.5,
      feeAmount: 0,
      currency: 'BRL',
      status: 'completed',
      refundedAt: '2024-01-15T11:00:00.000Z',
    },
  },
};

const eventDescriptions: Record<EventType, { title: string; description: string; color: string }> = {
  payment_completed: {
    title: 'Pagamento Confirmado',
    description: 'Enviado quando um pagamento PIX e confirmado com sucesso.',
    color: 'emerald',
  },
  payment_failed: {
    title: 'Pagamento Falhou',
    description: 'Enviado quando um pagamento falha ou expira.',
    color: 'red',
  },
  refund_completed: {
    title: 'Reembolso Concluido',
    description: 'Enviado quando um reembolso e processado.',
    color: 'amber',
  },
};

const codeExample = `import { parseWebhook } from '@pague-dev/sdk-node';

app.post('/webhook', (req, res) => {
  // 1. Parse the webhook payload
  const event = parseWebhook(req.body);

  if (!event) {
    return res.status(400).send('Invalid payload');
  }

  // 2. Handle with full type safety
  switch (event.event) {
    case 'payment_completed':
      // event.data is PaymentCompletedData
      await handlePayment(event.data.transactionId);
      break;

    case 'payment_failed':
      // event.data is PaymentFailedData
      await handleFailure(event.data.failureReason);
      break;

    case 'refund_completed':
      // event.data is RefundCompletedData
      await handleRefund(event.data.originalTransactionId);
      break;
  }

  res.status(200).send('OK');
});`;

export function WebhooksFlow() {
  const [selectedEvent, setSelectedEvent] = useState<EventType>('payment_completed');

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Types */}
        <Card>
          <FormHeader icon={<WebhookIcon />} title="Webhooks" color="violet" />
          <p className="text-zinc-400 text-sm mb-6">
            Receba notificacoes em tempo real sobre eventos de pagamento.
          </p>
          <h3 className="text-lg font-semibold mb-4">Tipos de Eventos</h3>

          <div className="space-y-3">
            {(Object.keys(eventDescriptions) as EventType[]).map((eventType) => {
              const { title, description, color } = eventDescriptions[eventType];
              const isSelected = selectedEvent === eventType;

              return (
                <button
                  key={eventType}
                  onClick={() => setSelectedEvent(eventType)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? `bg-${color}-900/20 border-${color}-700`
                      : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        color === 'emerald' ? 'bg-emerald-500' : color === 'red' ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="text-sm text-zinc-400">{description}</p>
                      <code className="text-xs text-zinc-500 mt-1 block">{eventType}</code>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Headers Info */}
          <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
            <h3 className="font-semibold text-sm text-zinc-300 mb-3">Headers enviados</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Content-Type</span>
                <span className="text-zinc-300">application/json</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">X-Webhook-Signature</span>
                <span className="text-zinc-300">HMAC-SHA256</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">X-Webhook-Timestamp</span>
                <span className="text-zinc-300">Unix ms</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Payload Example */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Payload de Exemplo</h2>
            <CopyButton text={JSON.stringify(eventExamples[selectedEvent], null, 2)} />
          </div>

          <pre className="bg-zinc-950 rounded-xl p-4 overflow-x-auto text-sm">
            <code className="text-emerald-400">{JSON.stringify(eventExamples[selectedEvent], null, 2)}</code>
          </pre>
        </Card>
      </div>

      {/* Code Example */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Implementacao com o SDK</h2>
            <p className="text-zinc-400 text-sm mt-1">
              Use <code className="text-violet-400">parseWebhook()</code> para parsing type-safe do payload.
            </p>
          </div>
          <CopyButton text={codeExample} label="Copiar codigo" />
        </div>

        <pre className="bg-zinc-950 rounded-xl p-4 overflow-x-auto text-sm">
          <code className="text-zinc-300">{codeExample}</code>
        </pre>
      </Card>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800">
          <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">Valide a assinatura</h3>
          <p className="text-zinc-400 text-sm">Verifique o header X-Webhook-Signature usando HMAC-SHA256 antes de processar.</p>
        </div>

        <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800">
          <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">Responda rapido</h3>
          <p className="text-zinc-400 text-sm">Retorne HTTP 200 rapidamente. Processe webhooks de forma assincrona se necessario.</p>
        </div>

        <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-800">
          <div className="w-10 h-10 bg-amber-600/20 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">Seja idempotente</h3>
          <p className="text-zinc-400 text-sm">Use o eventId para evitar processar o mesmo evento duas vezes em caso de retry.</p>
        </div>
      </div>
    </div>
  );
}
