'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createPerson, deletePerson } from '@/lib/queries';
import { requireOffice } from '@/lib/session';

export async function createPersonAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await requireOffice();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Name is required.' };
  await createPerson(session.shopId, name);
  revalidatePath('/office/people');
  redirect('/office/people');
}

export async function deletePersonAction(personId: string): Promise<{ error?: string }> {
  const session = await requireOffice();
  try {
    await deletePerson(session.shopId, personId);
  } catch {
    return {
      error: 'Cannot remove this person while they are assigned to a job.',
    };
  }
  revalidatePath('/office/people');
  return {};
}
