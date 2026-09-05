import { Badge } from '@/components/ui/badge';
import { isCep5Type } from '@/lib/job-catalog';
import type { JobRow } from '@/lib/types';

export function JobStateBadges({
  job,
}: {
  job: Pick<JobRow, 'status' | 'flagged' | 'type'>;
}) {
  return (
    <div className='flex flex-wrap items-center gap-1.5'>
      {job.status === 'complete' ? (
        <Badge variant='secondary'>Complete</Badge>
      ) : job.status === 'canceled' ? (
        <Badge variant='outline'>Canceled</Badge>
      ) : (
        <Badge variant='outline'>Not started</Badge>
      )}
      {job.flagged ? <Badge variant='destructive'>Flagged</Badge> : null}
      {isCep5Type(job.type) ? <Badge>CEP-5</Badge> : null}
    </div>
  );
}
