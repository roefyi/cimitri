'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { clearSession, readSession, writeSession } from '@/lib/auth';
import { ensureDemoShop } from '@/lib/demo-seed';
import { getPerson } from '@/lib/queries';

function trim(value: FormDataEntryValue | null): string {
  return String(value ?? '').trim();
}

async function startDemoSession() {
  const shop = await ensureDemoShop();
  await writeSession({
    shopId: shop.id,
    shopName: shop.name,
    email: shop.email,
    mode: null,
    personId: null,
    personName: null,
  });
  redirect('/mode');
}

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = trim(formData.get('email'));
  const password = String(formData.get('password') ?? '');
  if (!email || !password) {
    return { error: 'Enter any email and password to continue.' };
  }
  await startDemoSession();
}

export async function logoutAction(): Promise<void> {
  clearSession();
  redirect('/login');
}

export async function setModeAction(mode: 'office' | 'crew'): Promise<void> {
  const session = await readSession();
  if (!session) redirect('/login');
  await writeSession({
    ...session,
    mode,
    personId: mode === 'crew' ? session.personId : null,
    personName: mode === 'crew' ? session.personName : null,
  });
  redirect(mode === 'office' ? '/office/jobs' : '/crew/who');
}

export async function setPersonAction(personId: string): Promise<void> {
  const session = await readSession();
  if (!session) redirect('/login');
  const person = await getPerson(session.shopId, personId);
  if (!person) {
    redirect('/crew/who');
  }
  await writeSession({
    ...session,
    mode: 'crew',
    personId: person.id,
    personName: person.name,
  });
  redirect('/crew');
}

export async function switchPersonAction(): Promise<void> {
  const session = await readSession();
  if (!session) redirect('/login');
  await writeSession({
    ...session,
    mode: 'crew',
    personId: null,
    personName: session.personName,
  });
  revalidatePath('/crew/who');
  redirect('/crew/who');
}
