import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageCard, PageHeader } from '@/components/dashboard';
import { EditSiteForm } from '@/components/site-form';
import { JobCard } from '@/components/job-card';
import { getSite, listJobsForSite } from '@/lib/queries';
import { requireOffice } from '@/lib/session';

export default async function SitePage({ params }: { params: { id: string } }) {
  const session = await requireOffice();
  const site = await getSite(session.shopId, params.id);
  if (!site) notFound();
  const jobs = await listJobsForSite(session.shopId, site.id);

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title={site.isYardPickup ? 'Yard / pickup' : site.address911}
        description={`${site.customerName} · Owner/applicant: ${site.ownerApplicantName}`}
      >
        <Button asChild>
          <Link
            href={`/office/jobs/new?customerId=${site.customerId}&siteId=${site.id}`}
          >
            New job
          </Link>
        </Button>
      </PageHeader>

      <div className='grid items-start gap-6 xl:grid-cols-3'>
        <PageCard title='Jobs here' className='xl:col-span-1'>
          {jobs.length === 0 ? (
            <p className='text-paragraph-sm text-text-sub-600'>
              No jobs at this site yet.
            </p>
          ) : (
            <div className='flex flex-col gap-3'>
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} href={`/office/jobs/${job.id}`} />
              ))}
            </div>
          )}
        </PageCard>
        <PageCard title='Site details' className='xl:col-span-2'>
          <EditSiteForm site={site} />
        </PageCard>
      </div>
    </div>
  );
}
