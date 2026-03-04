import { Pdev } from '@pague-dev/sdk-node';

export function createPdevClient(apiKey: string) {
  return new Pdev(apiKey);
}

export async function createPixCharge(apiKey: string, formData: FormData) {
  const pdev = createPdevClient(apiKey);

  const amount = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;
  const customerId = formData.get('customerId') as string;
  const customerName = formData.get('customerName') as string;
  const customerDocument = formData.get('customerDocument') as string;
  const projectId = formData.get('projectId') as string;
  const expiresIn = parseInt(formData.get('expiresIn') as string) || 3600;

  const result = await pdev.pix.create({
    amount,
    description,
    ...(customerId
      ? { customerId }
      : {
          customer: {
            name: customerName,
            document: customerDocument,
          },
        }),
    ...(projectId && { projectId }),
    expiresIn,
  });

  return result;
}

export async function createStaticQrCode(apiKey: string, formData: FormData) {
  const pdev = createPdevClient(apiKey);
  const amount = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;
  const externalReference = formData.get('externalReference') as string;
  const projectId = formData.get('projectId') as string;

  return pdev.pix.createStaticQrCode({
    amount,
    description,
    ...(projectId && { projectId }),
    ...(externalReference && { externalReference }),
  });
}

export async function createCustomer(apiKey: string, formData: FormData) {
  const pdev = createPdevClient(apiKey);

  const name = formData.get('name') as string;
  const document = formData.get('document') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;

  const result = await pdev.customers.create({
    name,
    document,
    email: email || undefined,
    phone: phone || undefined,
  });

  return result;
}

export async function listCustomers(apiKey: string, page = 1, limit = 10, search?: string) {
  const pdev = createPdevClient(apiKey);
  const result = await pdev.customers.list({ page, limit, ...(search && { search }) });
  return result;
}

export async function createProject(apiKey: string, formData: FormData) {
  const pdev = createPdevClient(apiKey);

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const color = formData.get('color') as string;

  const result = await pdev.projects.create({
    name,
    description: description || undefined,
    color,
  });

  return result;
}

export async function listProjects(apiKey: string, page = 1, limit = 10) {
  const pdev = createPdevClient(apiKey);
  const result = await pdev.projects.list({ page, limit });
  return result;
}

export async function createCharge(apiKey: string, formData: FormData) {
  const pdev = createPdevClient(apiKey);

  const projectId = formData.get('projectId') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const customerId = formData.get('customerId') as string;

  const result = await pdev.charges.create({
    projectId,
    name,
    description: description || undefined,
    amount,
    paymentMethods: ['pix'],
    ...(customerId && { customerId }),
  });

  return result;
}

export async function getTransaction(apiKey: string, id: string) {
  const pdev = createPdevClient(apiKey);
  const result = await pdev.transactions.get(id);
  return result;
}

export async function listCharges(apiKey: string, page = 1, limit = 10) {
  const pdev = createPdevClient(apiKey);
  const result = await pdev.charges.list({ page, limit });
  return result;
}

export async function getCharge(apiKey: string, id: string) {
  const pdev = createPdevClient(apiKey);
  const result = await pdev.charges.get(id);
  return result;
}

export async function getAccountInfo(apiKey: string) {
  const pdev = createPdevClient(apiKey);
  return pdev.account.get();
}

export async function createWithdrawal(apiKey: string, formData: FormData) {
  const pdev = createPdevClient(apiKey);

  const amount = parseFloat(formData.get('amount') as string);
  const bankAccountId = formData.get('bankAccountId') as string;
  const pixKey = formData.get('pixKey') as string;
  const pixKeyType = formData.get('pixKeyType') as string;
  const holderName = formData.get('holderName') as string;
  const holderDocument = formData.get('holderDocument') as string;

  const result = await pdev.withdrawals.create({
    amount,
    ...(bankAccountId
      ? { bankAccountId }
      : {
          pixKey,
          pixKeyType: pixKeyType as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random',
          holderName,
          holderDocument,
        }),
  });

  return result;
}
