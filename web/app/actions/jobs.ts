'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  JOB_TYPES,
  crewMaySetStatus,
  jobTypeNeedsOssFields,
  type JobType,
} from '@/db/types';
import {
  addNote,
  createJob,
  duplicateJobToNextDay,
  getJob,
  personIsAssigned,
  setJobFlag,
  setJobStatus,
  updateJob,
} from '@/lib/queries';
import { requireCrewPerson, requireOffice } from '@/lib/session';

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function readJob(formData: FormData) {
  const customerId = String(formData.get('customerId') ?? '');
  const siteId = String(formData.get('siteId') ?? '');
  const type = String(formData.get('type') ?? '') as JobType;
  const scheduledDate = String(formData.get('scheduledDate') ?? '');
  const scheduledTime = blankToNull(String(formData.get('scheduledTime') ?? ''));
  const personIds = formData.getAll('personIds').map(String).filter(Boolean);
  const permitNumber = blankToNull(String(formData.get('permitNumber') ?? ''));
  const tank = blankToNull(String(formData.get('tank') ?? ''));
  const systemType = blankToNull(String(formData.get('systemType') ?? ''));

  if (!customerId || !siteId || !scheduledDate) {
    return { error: 'Customer, site, and date are required.' } as const;
  }
  if (!JOB_TYPES.includes(type)) {
    return { error: 'Choose a job type.' } as const;
  }
  if (personIds.length < 1) {
    return { error: 'Assign at least one person.' } as const;
  }
  if (jobTypeNeedsOssFields(type) && (!permitNumber || !tank || !systemType)) {
    return {
      error: 'Permit number, tank, and system type are required for Alabama OSS jobs.',
    } as const;
  }
  return {
    customerId,
    siteId,
    type,
    scheduledDate,
    scheduledTime,
    personIds,
    permitNumber,
    tank,
    systemType,
  };
}

export async function createJobAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await requireOffice();
  const input = readJob(formData);
  if ('error' in input) return { error: input.error };
  const id = await createJob(session.shopId, input);
  revalidatePath('/office/jobs');
  redirect(`/office/jobs/${id}`);
}

export async function updateJobAction(
  jobId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await requireOffice();
  const input = readJob(formData);
  if ('error' in input) return { error: input.error };
  await updateJob(session.shopId, jobId, input);
  revalidatePath(`/office/jobs/${jobId}`);
  revalidatePath('/office/jobs');
  return {};
}

export async function cancelJobAction(jobId: string): Promise<void> {
  const session = await requireOffice();
  await setJobStatus(session.shopId, jobId, 'canceled');
  revalidatePath(`/office/jobs/${jobId}`);
  revalidatePath('/office/jobs');
}

export async function clearFlagAction(jobId: string): Promise<void> {
  const session = await requireOffice();
  await setJobFlag(session.shopId, jobId, false, null);
  revalidatePath(`/office/jobs/${jobId}`);
  revalidatePath('/office/jobs');
}

export async function duplicateJobAction(jobId: string): Promise<void> {
  const session = await requireOffice();
  const nextId = await duplicateJobToNextDay(session.shopId, jobId);
  revalidatePath('/office/jobs');
  redirect(`/office/jobs/${nextId}`);
}

export async function crewSetCompleteAction(
  jobId: string,
  complete: boolean,
): Promise<{ error?: string; queued?: boolean }> {
  const session = await requireCrewPerson();
  const assigned = await personIsAssigned(jobId, session.personId);
  if (!assigned) return { error: 'This job is not assigned to you.' };
  const job = await getJob(session.shopId, jobId);
  if (!job) return { error: 'Job not found.' };
  const next = complete ? 'complete' : 'not_started';
  if (!crewMaySetStatus(job.status, next)) {
    return { error: 'This job cannot be updated.' };
  }
  await setJobStatus(session.shopId, jobId, next);
  revalidatePath('/crew');
  revalidatePath(`/crew/jobs/${jobId}`);
  return {};
}

export async function crewFlagAction(
  jobId: string,
  note: string,
): Promise<{ error?: string }> {
  const session = await requireCrewPerson();
  const assigned = await personIsAssigned(jobId, session.personId);
  if (!assigned) return { error: 'This job is not assigned to you.' };
  const trimmed = note.trim();
  if (!trimmed) return { error: 'A short note is required.' };
  const job = await getJob(session.shopId, jobId);
  if (!job || job.status === 'canceled') {
    return { error: 'This job cannot be flagged.' };
  }
  await setJobFlag(session.shopId, jobId, true, trimmed);
  revalidatePath('/crew');
  revalidatePath(`/crew/jobs/${jobId}`);
  return {};
}

export async function addJobNoteAction(
  jobId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const body = String(formData.get('body') ?? '').trim();
  if (!body) return { error: 'Note cannot be empty.' };
  const office = await import('@/lib/auth').then((m) => m.readSession());
  if (!office) return { error: 'Sign in required.' };
  const job = await getJob(office.shopId, jobId);
  if (!job) return { error: 'Job not found.' };
  if (office.mode === 'crew') {
    if (!office.personId || !(await personIsAssigned(jobId, office.personId))) {
      return { error: 'This job is not assigned to you.' };
    }
  } else if (office.mode !== 'office') {
    return { error: 'Choose Office or Crew first.' };
  }
  if (!jobTypeNeedsOssFields(job.type)) {
    return { error: 'Notes for the form are only on Alabama OSS jobs.' };
  }
  await addNote(jobId, body);
  revalidatePath(`/office/jobs/${jobId}`);
  revalidatePath(`/crew/jobs/${jobId}`);
  revalidatePath(`/office/jobs/${jobId}/cep5`);
  return {};
}
