import { useState } from 'react';
import { Card, FormHeader, CopyButton, WebhookIcon } from '../ui';

type EventType = 'payment_completed' | 'payment_expired' | 'refund_completed' | 'withdrawal_completed' | 'withdrawal_failed' | 'withdrawal_reversed';

const eventExamples: Record<EventType, object> = {
  payment_completed: {
    event: 'payment_completed',
    eventId: 'a0b78f10-c7f4-4f5d-98dd-3e36eafeb812',
    timestamp: '2026-01-11T19:03:28.280Z',
    data: {
      transactionId: 'a0b78f10-c7f4-4f5d-98dd-3e36eafeb812',
      environment: 'sandbox',
      amount: 100.21,
      feeAmount: 0.5,
      netAmount: 99.71,
      currency: 'BRL',
      paymentMethod: 'pix',
      status: 'completed',
      completedAt: '2026-01-11T19:03:28.277Z',
      externalReference: 'pedido-12345',
      metadata: {
        orderId: 'ORDER-12345',
        customerId: 'CUST-67890',
      },
    },
  },
  payment_expired: {
    event: 'payment_expired',
    eventId: 'payment_expired_d5e6f7a8-1234-5678-9abc-def012345678',
    timestamp: '2026-01-11T19:30:00.000Z',
    data: {
      transactionId: 'd5e6f7a8-1234-5678-9abc-def012345678',
      environment: 'sandbox',
      amount: 75.50,
      feeAmount: 0,
      netAmount: 0,
      currency: 'BRL',
      paymentMethod: 'pix',
      status: 'expired',
      expiredAt: '2026-01-11T19:30:00.000Z',
      externalReference: 'pedido-12345',
      metadata: {
        orderId: 'ORDER-12345',
        customerId: 'CUST-67890',
      },
    },
  },
  refund_completed: {
    event: 'refund_completed',
    eventId: 'c92d45e6-8b33-4f12-a789-2e56f8901def',
    timestamp: '2026-01-11T19:22:15.456Z',
    data: {
      refundTransactionId: 'c92d45e6-8b33-4f12-a789-2e56f8901def',
      originalTransactionId: 'a0b78f10-c7f4-4f5d-98dd-3e36eafeb812',
      environment: 'sandbox',
      amount: 50.0,
      feeAmount: 0.25,
      netAmount: 49.75,
      currency: 'BRL',
      paymentMethod: 'pix',
      status: 'completed',
      refundedAt: '2026-01-11T19:22:15.400Z',
      externalReference: 'pedido-12345',
      metadata: {
        orderId: 'ORDER-12345',
        customerId: 'CUST-67890',
      },
    },
  },
  withdrawal_completed: {
    event: 'withdrawal_completed',
    eventId: 'e73775b5-70ee-4bad-be4c-4acff9890e27',
    timestamp: '2026-01-11T19:08:21.953Z',
    data: {
      withdrawalId: 'e73775b5-70ee-4bad-be4c-4acff9890e27',
      environment: 'sandbox',
      amount: 500.0,
      feeAmount: 2.5,
      netAmount: 497.5,
      currency: 'BRL',
      status: 'completed',
      completedAt: '2026-01-11T19:08:21.939Z',
      metadata: {
        batchId: 'BATCH-001',
      },
    },
  },
  withdrawal_failed: {
    event: 'withdrawal_failed',
    eventId: 'b84f12c3-9a21-4e67-bc88-1d45f6789abc',
    timestamp: '2026-01-11T19:15:42.123Z',
    data: {
      withdrawalId: 'b84f12c3-9a21-4e67-bc88-1d45f6789abc',
      environment: 'sandbox',
      amount: 1000.0,
      feeAmount: 5.0,
      netAmount: 995.0,
      currency: 'BRL',
      status: 'failed',
      failedAt: '2026-01-11T19:15:42.100Z',
      failureReason: 'insufficient_funds',
      metadata: {
        batchId: 'BATCH-001',
      },
    },
  },
  withdrawal_reversed: {
    event: 'withdrawal_reversed',
    eventId: 'f12a34b5-6c78-9d01-ef23-456789abcdef',
    timestamp: '2026-01-11T20:00:00.000Z',
    data: {
      reversalTransactionId: 'f12a34b5-6c78-9d01-ef23-456789abcdef',
      originalTransactionId: 'e73775b5-70ee-4bad-be4c-4acff9890e27',
      environment: 'sandbox',
      amount: 500.0,
      feeAmount: 0,
      netAmount: 500.0,
      currency: 'BRL',
      paymentMethod: 'pix',
      status: 'completed',
      reversedAt: '2026-01-11T20:00:00.000Z',
      metadata: {
        batchId: 'BATCH-001',
      },
    },
  },
};

const eventDescriptions: Record<EventType, { title: string; description: string; color: string }> = {
  payment_completed: {
    title: 'Pagamento Confirmado',
    description: 'Enviado quando um pagamento PIX é confirmado com sucesso.',
    color: 'emerald',
  },
  payment_expired: {
    title: 'Pagamento Expirado',
    description: 'Enviado quando um pagamento PIX expira sem confirmação.',
    color: 'zinc',
  },
  refund_completed: {
    title: 'Reembolso Concluído',
    description: 'Enviado quando um reembolso é processado.',
    color: 'amber',
  },
  withdrawal_completed: {
    title: 'Saque Concluído',
    description: 'Enviado quando um saque é processado com sucesso.',
    color: 'blue',
  },
  withdrawal_failed: {
    title: 'Saque Falhou',
    description: 'Enviado quando um saque é rejeitado ou falha.',
    color: 'red',
  },
  withdrawal_reversed: {
    title: 'Saque Estornado',
    description: 'Enviado quando um saque é estornado pelo PSP.',
    color: 'violet',
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
      const { transactionId, metadata } = event.data;
      await handlePayment(transactionId, metadata);
      break;

    case 'payment_expired':
      // event.data is PaymentExpiredData
      await handleExpired(event.data.transactionId);
      break;

    case 'refund_completed':
      // event.data is RefundCompletedData
      await handleRefund(event.data.originalTransactionId);
      break;

    case 'withdrawal_completed':
      // event.data is WithdrawalCompletedData
      await handleWithdrawal(event.data.withdrawalId);
      break;

    case 'withdrawal_failed':
      // event.data is WithdrawalFailedData
      await handleWithdrawalFailure(event.data.failureReason);
      break;

    case 'withdrawal_reversed':
      // event.data is WithdrawalReversedData
      await handleWithdrawalReversal(event.data.reversalTransactionId);
      break;
  }

  res.status(200).send('OK');
});`;

export function WebhooksFlow() {
  const [selectedEvent, setSelectedEvent] = useState<EventType>('payment_completed');

  const getColorClass = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500';
      case 'amber':
        return 'bg-amber-500';
      case 'blue':
        return 'bg-blue-500';
      case 'red':
        return 'bg-red-500';
      case 'violet':
        return 'bg-violet-500';
      case 'zinc':
        return 'bg-zinc-500';
      default:
        return 'bg-zinc-500';
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Types */}
        <Card>
          <FormHeader icon={<WebhookIcon />} title="Webhooks" color="violet" />
          <p className="text-zinc-400 text-sm mb-6">
            Receba notificações em tempo real sobre eventos de pagamento.
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
                    <div className={`w-3 h-3 rounded-full ${getColorClass(color)}`} />
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
            <h2 className="text-xl font-bold">Implementação com o SDK</h2>
            <p className="text-zinc-400 text-sm mt-1">
              Use <code className="text-violet-400">parseWebhook()</code> para parsing type-safe do payload.
            </p>
          </div>
          <CopyButton text={codeExample} label="Copiar código" />
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
          <h3 className="font-semibold mb-1">Responda rápido</h3>
          <p className="text-zinc-400 text-sm">Retorne HTTP 200 rapidamente. Processe webhooks de forma assíncrona se necessário.</p>
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
