import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageCard, PageHeader } from '@/components/dashboard';
import { CrewJobActions } from '@/components/crew-job-actions';
import { JobCapture } from '@/components/job-capture';
import { JobStateBadges } from '@/components/job-state-badges';
import { isCep5Type, jobTypeLabel } from '@/lib/job-catalog';
import { formatLongDate, formatTime } from '@/lib/dates';
import { getJob, personIsAssigned } from '@/lib/queries';
import { requireCrewPerson } from '@/lib/session';

export default async function CrewJobPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireCrewPerson();
  const assigned = await personIsAssigned(params.id, session.personId);
  if (!assigned) notFound();
  const job = await getJob(session.shopId, params.id);
  if (!job) notFound();

  const others = job.assignees.filter((a) => a.id !== session.personId);

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title={jobTypeLabel(job.type)}
        description={`${formatLongDate(job.scheduledDate)}${
          job.scheduledTime ? ` · ${formatTime(job.scheduledTime)}` : ''
        }`}
      >
        <Link href='/crew' className='text-label-sm text-text-sub-600'>
          Back to my jobs
        </Link>
      </PageHeader>

      <div className='flex flex-wrap items-center gap-3'>
        <JobStateBadges job={job} />
        <p className='text-label-sm text-text-strong-950'>
          {job.siteIsYard ? 'Yard / pickup' : job.siteAddress}
        </p>
        <p className='text-paragraph-sm text-text-sub-600'>{job.customerName}</p>
      </div>

      <div className='grid items-start gap-6 xl:grid-cols-3'>
        <PageCard title='Job' className='xl:col-span-2'>
          <dl className='grid gap-4 sm:grid-cols-2'>
            <div>
              <dt className='text-paragraph-xs text-text-sub-600'>Where</dt>
              <dd className='mt-1 text-paragraph-sm text-text-strong-950'>
                {job.siteIsYard ? 'Yard / pickup' : job.siteAddress}
              </dd>
            </div>
            <div>
              <dt className='text-paragraph-xs text-text-sub-600'>Customer</dt>
              <dd className='mt-1 text-paragraph-sm text-text-strong-950'>
                {job.customerName}
              </dd>
            </div>
            <div>
              <dt className='text-paragraph-xs text-text-sub-600'>Also assigned</dt>
              <dd className='mt-1 text-paragraph-sm text-text-strong-950'>
                {others.length ? others.map((a) => a.name).join(', ') : 'Just you'}
              </dd>
            </div>
            {job.flagged && job.flagNote ? (
              <div className='sm:col-span-2'>
                <dt className='text-paragraph-xs text-text-sub-600'>Flag</dt>
                <dd className='mt-1 text-paragraph-sm text-error-dark'>{job.flagNote}</dd>
              </div>
            ) : null}
          </dl>
        </PageCard>
        <PageCard title='Actions'>
          <CrewJobActions job={job} />
        </PageCard>
        {isCep5Type(job.type) ? (
          <PageCard title='Photos and notes' className='xl:col-span-3'>
            <JobCapture jobId={job.id} notes={job.notes} photos={job.photos} />
          </PageCard>
        ) : null}
      </div>
    </div>
  );
}
