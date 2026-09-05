import Link from 'next/link';
import { PrintButton } from '@/components/print-button';
import { getJob, upsertDraftFromJob } from '@/lib/queries';
import { requireOffice } from '@/lib/session';
import { isCep5Type, jobTypeLabel } from '@/lib/job-catalog';
import { notFound, redirect } from 'next/navigation';

export default async function Cep5Page({ params }: { params: { id: string } }) {
  const session = await requireOffice();
  const job = await getJob(session.shopId, params.id);
  if (!job) notFound();
  if (!isCep5Type(job.type)) redirect(`/office/jobs/${job.id}`);
  await upsertDraftFromJob(session.shopId, job.id);
  const fresh = await getJob(session.shopId, job.id);
  const draft = fresh?.draft;
  if (!draft) notFound();

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-3 print:hidden'>
        <div>
          <Link href={`/office/jobs/${job.id}`} className='text-label-sm text-text-sub-600'>
            Back to job
          </Link>
          <h1 className='mt-2 text-title-h5'>CEP-5 draft</h1>
          <p className='mt-1 max-w-xl text-paragraph-sm text-text-sub-600'>
            Copied from the customer, site, and job. This is not approval and is
            not filed with ADPH. Print for a wet signature. AOWB license and
            remaining certification lines stay on paper.
          </p>
        </div>
        <PrintButton>Print / save PDF</PrintButton>
      </div>

      <article className='rounded-20 bg-bg-white-0 p-6 ring-1 ring-stroke-soft-200 print:ring-0'>
        <p className='text-subheading-sm uppercase text-text-sub-600'>
          Alabama Department of Public Health
        </p>
        <h2 className='mt-1 text-title-h6'>
          Installer&apos;s Onsite Sewage Disposal System Certification (CEP-5)
        </h2>
        <p className='mt-2 text-paragraph-sm text-text-sub-600'>
          Draft from Cimitri · {jobTypeLabel(job.type)} · {job.scheduledDate}
        </p>

        <dl className='mt-6 grid gap-4 sm:grid-cols-2'>
          <Field label='Payer' value={draft.payerName} />
          <Field label='Payer phone' value={draft.payerPhone} />
          <Field label='Payer email' value={draft.payerEmail} />
          <Field label='Owner / applicant' value={draft.ownerApplicantName} />
          <Field
            label='911 address'
            value={[draft.address911, draft.city, draft.state, draft.zip]
              .filter(Boolean)
              .join(', ')}
          />
          <Field label='Permit #' value={draft.permitNumber} />
          <Field label='Tank' value={draft.tank} />
          <Field label='System type' value={draft.systemType} />
          <Field label='AOWB license' value='Fill on paper' />
          <Field label='Installer signature' value='Wet signature after print' />
        </dl>

        <section className='mt-8'>
          <h3 className='text-label-md'>Field notes</h3>
          {job.notes.length === 0 ? (
            <p className='mt-2 text-paragraph-sm text-text-sub-600'>No notes yet.</p>
          ) : (
            <ul className='mt-2 list-disc space-y-1 pl-5 text-paragraph-sm'>
              {job.notes.map((note) => (
                <li key={note.id}>{note.body}</li>
              ))}
            </ul>
          )}
        </section>

        <section className='mt-8'>
          <h3 className='text-label-md'>Photos</h3>
          {job.photos.length === 0 ? (
            <p className='mt-2 text-paragraph-sm text-text-sub-600'>No photos yet.</p>
          ) : (
            <div className='mt-3 grid grid-cols-2 gap-3'>
              {job.photos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photo.storageUrl}
                  alt='Job photo'
                  className='w-full rounded-lg object-cover'
                />
              ))}
            </div>
          )}
        </section>
      </article>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className='text-subheading-xs uppercase text-text-soft-400'>{label}</dt>
      <dd className='mt-1 font-mono text-paragraph-sm text-text-strong-950'>
        {value || '—'}
      </dd>
    </div>
  );
}
