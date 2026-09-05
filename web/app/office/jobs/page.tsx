import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageCard, PageHeader, StatCard } from '@/components/dashboard';
import { JobCard } from '@/components/job-card';
import { JobStateBadges } from '@/components/job-state-badges';
import { ScheduleCalendar } from '@/components/schedule-calendar';
import { jobTypeLabel } from '@/lib/job-catalog';
import {
  addDaysIso,
  daysInWeek,
  formatDayHeading,
  formatLongDate,
  formatTime,
  monthBounds,
  todayIso,
  weekBounds,
} from '@/lib/dates';
import { listCustomers, listJobsInRange, listPeople } from '@/lib/queries';
import { requireOffice } from '@/lib/session';
import { cn } from '@/lib/utils';
import type { JobRow } from '@/lib/types';

function jobsForDay(jobs: JobRow[], day: string) {
  return jobs.filter((job) => job.scheduledDate === day);
}

export default async function OfficeJobsPage({
  searchParams,
}: {
  searchParams: { range?: string; date?: string };
}) {
  const session = await requireOffice();
  const date =
    searchParams.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date)
      ? searchParams.date
      : todayIso();
  const range = searchParams.range === 'week' ? 'week' : 'today';
  const week = weekBounds(date);
  const month = monthBounds(date);
  const listBounds = range === 'week' ? week : { from: date, to: date };
  const [jobs, monthJobs, people, customers] = await Promise.all([
    listJobsInRange(session.shopId, listBounds.from, listBounds.to),
    listJobsInRange(session.shopId, month.from, month.to),
    listPeople(session.shopId),
    listCustomers(session.shopId),
  ]);
  const days = daysInWeek(week.from, week.to);
  const flagged = jobs.filter((job) => job.flagged).length;
  const open = jobs.filter((job) => job.status === 'not_started').length;
  const complete = jobs.filter((job) => job.status === 'complete').length;
  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Schedule'
        description={
          range === 'week'
            ? `Week of ${formatLongDate(week.from)}`
            : formatLongDate(date)
        }
      >
        <Button asChild variant='outline'>
          <Link href={`/office/jobs?range=${range}&date=${addDaysIso(date, -1)}`}>
            Previous
          </Link>
        </Button>
        <Button asChild variant='outline'>
          <Link href={`/office/jobs?range=${range}&date=${todayIso()}`}>Today</Link>
        </Button>
        <Button asChild variant='outline'>
          <Link href={`/office/jobs?range=${range}&date=${addDaysIso(date, 1)}`}>
            Next
          </Link>
        </Button>
        <Button asChild>
          <Link href='/office/jobs/new'>New job</Link>
        </Button>
      </PageHeader>

      {people.length === 0 || customers.length === 0 ? (
        <PageCard title='Set up the shop'>
          <ol className='list-decimal space-y-2 pl-5 text-paragraph-sm text-text-sub-600'>
            <li>
              {people.length === 0 ? (
                <Link href='/office/people' className='text-primary'>
                  Add people
                </Link>
              ) : (
                'People added'
              )}
            </li>
            <li>
              {customers.length === 0 ? (
                <Link href='/office/customers/new' className='text-primary'>
                  Add a customer
                </Link>
              ) : (
                'Customer added — add a site, then a job'
              )}
            </li>
            <li>Create a job and assign crew</li>
          </ol>
        </PageCard>
      ) : null}

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard label='Jobs in view' value={jobs.length} />
        <StatCard label='Not started' value={open} />
        <StatCard label='Complete' value={complete} />
        <StatCard
          label='Flagged'
          value={flagged}
          hint={flagged ? 'Needs a follow-up' : undefined}
        />
      </div>

      <div className='grid items-start gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]'>
        <PageCard title='Calendar'>
          <div className='mb-4 flex rounded-10 bg-bg-weak-50 p-1'>
            <Link
              href={`/office/jobs?range=today&date=${date}`}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-center text-label-sm',
                range === 'today'
                  ? 'bg-bg-white-0 text-text-strong-950 shadow-toggle-switch'
                  : 'text-text-sub-600',
              )}
            >
              Day
            </Link>
            <Link
              href={`/office/jobs?range=week&date=${date}`}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-center text-label-sm',
                range === 'week'
                  ? 'bg-bg-white-0 text-text-strong-950 shadow-toggle-switch'
                  : 'text-text-sub-600',
              )}
            >
              Week
            </Link>
          </div>
          <div className='-mx-2 overflow-x-auto'>
            <ScheduleCalendar
              selectedIso={date}
              jobDates={[...new Set(monthJobs.map((job) => job.scheduledDate))]}
              hrefForDate={`/office/jobs?range=${range}&date=DATE`}
            />
          </div>
        </PageCard>

        <div className='flex min-w-0 flex-col gap-6'>
          {range === 'week' ? (
            <PageCard title='This week' padded={false}>
              <div className='grid grid-cols-1 gap-px bg-stroke-soft-200 sm:grid-cols-2 xl:grid-cols-7'>
                {days.map((day) => {
                  const dayJobs = jobsForDay(jobs, day);
                  const selected = day === date;
                  return (
                    <div
                      key={day}
                      className={cn(
                        'min-h-[12rem] bg-bg-white-0 p-3',
                        selected && 'bg-orange-50/60',
                      )}
                    >
                      <Link
                        href={`/office/jobs?range=week&date=${day}`}
                        className={cn(
                          'text-label-xs',
                          selected ? 'text-primary' : 'text-muted-foreground',
                        )}
                      >
                        {formatDayHeading(day)}
                        <span className='ml-1 tabular-nums'>{dayJobs.length}</span>
                      </Link>
                      <div className='mt-2 flex flex-col gap-1.5'>
                        {dayJobs.map((job) => (
                          <Link
                            key={job.id}
                            href={`/office/jobs/${job.id}`}
                            className='block rounded-lg bg-bg-white-0 p-2 ring-1 ring-stroke-soft-200'
                          >
                            <p className='truncate text-label-xs text-text-strong-950'>
                              {job.scheduledTime
                                ? `${formatTime(job.scheduledTime)} · `
                                : ''}
                              {jobTypeLabel(job.type)}
                            </p>
                            <p className='truncate text-paragraph-xs text-text-sub-600'>
                              {job.customerName}
                            </p>
                            {job.flagged ? (
                              <p className='mt-1 text-paragraph-xs text-error-base'>
                                Flagged
                              </p>
                            ) : null}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </PageCard>
          ) : null}

          <PageCard
            title={range === 'week' ? 'Jobs this week' : `Jobs · ${formatLongDate(date)}`}
            padded={false}
          >
            {jobs.length === 0 ? (
              <p className='px-5 py-8 text-paragraph-sm text-text-sub-600'>
                No jobs in this range.
              </p>
            ) : (
              <>
                <div className='flex flex-col gap-3 p-5 xl:hidden'>
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} href={`/office/jobs/${job.id}`} />
                  ))}
                </div>
                <div className='hidden px-3 pb-3 xl:block'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Where</TableHead>
                        <TableHead>Crew</TableHead>
                        <TableHead>State</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <Link
                              href={`/office/jobs/${job.id}`}
                              className='text-label-sm'
                            >
                              {range === 'week' ? `${job.scheduledDate} · ` : ''}
                              {job.scheduledTime
                                ? formatTime(job.scheduledTime)
                                : 'All day'}
                            </Link>
                          </TableCell>
                          <TableCell>{jobTypeLabel(job.type)}</TableCell>
                          <TableCell>
                            {job.siteIsYard ? 'Yard / pickup' : job.siteAddress}
                            <span className='block text-paragraph-xs text-text-sub-600'>
                              {job.customerName}
                            </span>
                          </TableCell>
                          <TableCell>
                            {job.assignees.map((a) => a.name).join(', ')}
                          </TableCell>
                          <TableCell>
                            <JobStateBadges job={job} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </PageCard>
        </div>
      </div>
    </div>
  );
}
