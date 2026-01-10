# pague.dev SDK - Exemplo de Integração

Aplicação de exemplo que demonstra como integrar com o SDK [`@pague-dev/sdk-node`](https://www.npmjs.com/package/@pague-dev/sdk-node) para pagamentos.

## Demo

Acesse a aplicação em **[testeumpix.pague.dev](https://testeumpix.pague.dev)**

## Funcionalidades Demonstradas

- **PIX QR Code** - Geração de cobranças PIX com QR Code
- **Links de Pagamento** - Criação de charges com URLs compartilháveis
- **Clientes** - Cadastro e listagem de customers
- **Projetos** - Criação e gerenciamento de projects
- **Transações** - Consulta de transactions por ID
- **Webhooks** - Exemplos de payloads e implementação com `parseWebhook()`

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4

## Rodando Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` e informe sua API Key para testar os endpoints.

## Uso do SDK

O SDK é inicializado em `src/lib/api.ts`:

```typescript
import { Pdev } from '@pague-dev/sdk-node';

const pdev = new Pdev('sua_api_key');

// PIX
await pdev.pix.create({ amount, description, customer });

// Charges
await pdev.charges.create({ projectId, name, amount, paymentMethods });
await pdev.charges.list({ page, limit });
await pdev.charges.get(id);

// Customers
await pdev.customers.create({ name, document });
await pdev.customers.list({ page, limit, search });

// Projects
await pdev.projects.create({ name, color });
await pdev.projects.list({ page, limit });

// Transactions
await pdev.transactions.get(id);
```

## Documentação

Consulte a documentação completa em **[docs.pague.dev](https://docs.pague.dev)**
