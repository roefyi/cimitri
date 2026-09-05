import Link from 'next/link';
import * as Button from '@/components/ui/button';
import { PageCard, PageHeader } from '@/components/dashboard';
import { JobForm } from '@/components/job-form';
import { JobCapture } from '@/components/job-capture';
import { JobStateBadges } from '@/components/job-state-badges';
import {
  cancelJobAction,
  clearFlagAction,
  duplicateJobAction,
} from '@/app/actions/jobs';
import { isCep5Type, jobTypeLabel } from '@/lib/job-catalog';
import { formatLongDate, formatTime } from '@/lib/dates';
import { getJob, listCustomers, listPeople, listSites } from '@/lib/queries';
import { requireOffice } from '@/lib/session';
import { notFound } from 'next/navigation';

export default async function OfficeJobPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireOffice();
  const job = await getJob(session.shopId, params.id);
  if (!job) notFound();
  const [customers, sites, people] = await Promise.all([
    listCustomers(session.shopId),
    listSites(session.shopId),
    listPeople(session.shopId),
  ]);

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title={jobTypeLabel(job.type)}
        description={`${formatLongDate(job.scheduledDate)}${
          job.scheduledTime ? ` · ${formatTime(job.scheduledTime)}` : ''
        } · ${job.customerName}`}
      >
        {isCep5Type(job.type) ? (
          <Button.Root asChild>
            <Link href={`/office/jobs/${job.id}/cep5`}>CEP-5 draft</Link>
          </Button.Root>
        ) : null}
        <form action={duplicateJobAction.bind(null, job.id)}>
          <Button.Root type='submit' variant='neutral' mode='stroke'>
            Duplicate to next day
          </Button.Root>
        </form>
        {job.flagged ? (
          <form action={clearFlagAction.bind(null, job.id)}>
            <Button.Root type='submit' variant='neutral' mode='stroke'>
              Clear flag
            </Button.Root>
          </form>
        ) : null}
        {job.status !== 'canceled' ? (
          <form action={cancelJobAction.bind(null, job.id)}>
            <Button.Root type='submit' variant='error' mode='stroke'>
              Cancel job
            </Button.Root>
          </form>
        ) : null}
      </PageHeader>

      <div className='flex flex-wrap items-center gap-3'>
        <JobStateBadges job={job} />
        <Link
          href={`/office/customers/${job.customerId}`}
          className='text-label-sm text-primary-base'
        >
          {job.customerName}
        </Link>
        <Link
          href={`/office/sites/${job.siteId}`}
          className='text-label-sm text-primary-base'
        >
          {job.siteIsYard ? 'Yard / pickup' : job.siteAddress}
        </Link>
      </div>

      {job.flagged && job.flagNote ? (
        <PageCard title='Flag'>
          <p className='text-paragraph-sm text-error-dark'>{job.flagNote}</p>
        </PageCard>
      ) : null}

      <div className='grid items-start gap-6 xl:grid-cols-3'>
        <PageCard title='Job details' className='xl:col-span-2'>
          <JobForm customers={customers} sites={sites} people={people} job={job} />
        </PageCard>
        {isCep5Type(job.type) ? (
          <PageCard title='Field capture'>
            <JobCapture jobId={job.id} notes={job.notes} photos={job.photos} />
          </PageCard>
        ) : (
          <PageCard title='Crew'>
            <p className='text-paragraph-sm text-text-sub-600'>
              {job.assignees.map((a) => a.name).join(', ') || 'Unassigned'}
            </p>
          </PageCard>
        )}
      </div>
    </div>
  );
}
