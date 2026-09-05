import Link from 'next/link';
import { JobStateBadges } from '@/components/job-state-badges';
import { jobTypeLabel } from '@/lib/job-catalog';
import { formatTime } from '@/lib/dates';
import type { JobRow } from '@/lib/types';

export function JobCard({
  job,
  href,
}: {
  job: JobRow;
  href: string;
}) {
  return (
    <Link
      href={href}
      className='block rounded-20 bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-stroke-soft-200'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-label-sm text-text-strong-950'>
            {jobTypeLabel(job.type)}
          </p>
          <p className='mt-1 truncate text-paragraph-sm text-text-sub-600'>
            {job.siteIsYard ? 'Yard / pickup' : job.siteAddress} · {job.customerName}
          </p>
        </div>
        {job.scheduledTime ? (
          <p className='shrink-0 text-label-sm text-text-strong-950'>
            {formatTime(job.scheduledTime)}
          </p>
        ) : null}
      </div>
      <div className='mt-3 flex flex-wrap items-center gap-2'>
        <JobStateBadges job={job} />
        <p className='text-paragraph-xs text-text-sub-600'>
          {job.assignees.map((a) => a.name).join(', ') || 'Unassigned'}
        </p>
      </div>
      {job.flagged && job.flagNote ? (
        <p className='mt-2 text-paragraph-sm text-error-base'>{job.flagNote}</p>
      ) : null}
    </Link>
  );
}
