'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSite, updateSite, type SiteInput } from '@/lib/queries';
import { requireOffice } from '@/lib/session';

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function readSite(formData: FormData, customerId: string): SiteInput | { error: string } {
  const isYardPickup = formData.get('isYardPickup') === 'on';
  const address911 = String(formData.get('address911') ?? '').trim();
  const city = String(formData.get('city') ?? '').trim();
  const state = String(formData.get('state') ?? '').trim();
  const zip = String(formData.get('zip') ?? '').trim();
  const ownerApplicantName = String(formData.get('ownerApplicantName') ?? '').trim();
  if (!address911 || !city || !state || !zip || !ownerApplicantName) {
    return {
      error: 'Address, city, state, ZIP, and owner/applicant are required.',
    };
  }
  return {
    customerId,
    address911,
    city,
    state,
    zip,
    subdivision: blankToNull(String(formData.get('subdivision') ?? '')),
    lot: blankToNull(String(formData.get('lot') ?? '')),
    block: blankToNull(String(formData.get('block') ?? '')),
    ownerApplicantName,
    siteContactName: blankToNull(String(formData.get('siteContactName') ?? '')),
    siteContactPhone: blankToNull(String(formData.get('siteContactPhone') ?? '')),
    isYardPickup,
  };
}

export async function createSiteAction(
  customerId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await requireOffice();
  const input = readSite(formData, customerId);
  if ('error' in input) return input;
  const site = await createSite(session.shopId, input);
  revalidatePath(`/office/customers/${customerId}`);
  redirect(`/office/sites/${site.id}`);
}

export async function updateSiteAction(
  siteId: string,
  customerId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await requireOffice();
  const input = readSite(formData, customerId);
  if ('error' in input) return input;
  await updateSite(session.shopId, siteId, input);
  revalidatePath(`/office/sites/${siteId}`);
  revalidatePath(`/office/customers/${customerId}`);
  return {};
}
