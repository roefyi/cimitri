import * as StatusBadge from '@/components/ui/status-badge';
import * as Badge from '@/components/ui/badge';
import { isCep5Type } from '@/lib/job-catalog';
import type { JobRow } from '@/lib/types';

export function JobStateBadges({ job }: { job: Pick<JobRow, 'status' | 'flagged' | 'type'> }) {
  return (
    <div className='flex flex-wrap items-center gap-1.5'>
      {job.status === 'complete' ? (
        <StatusBadge.Root variant='light' status='completed'>
          <StatusBadge.Dot />
          Complete
        </StatusBadge.Root>
      ) : job.status === 'canceled' ? (
        <StatusBadge.Root variant='light' status='disabled'>
          <StatusBadge.Dot />
          Canceled
        </StatusBadge.Root>
      ) : (
        <StatusBadge.Root variant='light' status='pending'>
          <StatusBadge.Dot />
          Not started
        </StatusBadge.Root>
      )}
      {job.flagged ? (
        <StatusBadge.Root variant='light' status='failed'>
          <StatusBadge.Dot />
          Flagged
        </StatusBadge.Root>
      ) : null}
      {isCep5Type(job.type) ? (
        <Badge.Root variant='lighter' color='orange'>
          CEP-5
        </Badge.Root>
      ) : null}
    </div>
  );
}
