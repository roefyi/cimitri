'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createCustomer, updateCustomer } from '@/lib/queries';
import { requireOffice } from '@/lib/session';

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function createCustomerAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await requireOffice();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Payer name is required.' };
  const customer = await createCustomer(session.shopId, {
    name,
    phone: blankToNull(String(formData.get('phone') ?? '')),
    email: blankToNull(String(formData.get('email') ?? '')),
  });
  revalidatePath('/office/customers');
  redirect(`/office/customers/${customer.id}`);
}

export async function updateCustomerAction(
  customerId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await requireOffice();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Payer name is required.' };
  await updateCustomer(session.shopId, customerId, {
    name,
    phone: blankToNull(String(formData.get('phone') ?? '')),
    email: blankToNull(String(formData.get('email') ?? '')),
  });
  revalidatePath(`/office/customers/${customerId}`);
  revalidatePath('/office/customers');
  return {};
}
