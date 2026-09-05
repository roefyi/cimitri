import { JobForm } from '@/components/job-form';
import { PageCard, PageHeader } from '@/components/dashboard';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { listCustomers, listPeople, listSites } from '@/lib/queries';
import { requireOffice } from '@/lib/session';
import Link from 'next/link';

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: { customerId?: string; siteId?: string };
}) {
  const session = await requireOffice();
  const [customers, sites, people] = await Promise.all([
    listCustomers(session.shopId),
    listSites(session.shopId),
    listPeople(session.shopId),
  ]);

  return (
    <div className='flex flex-col gap-6'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/office/jobs'>Schedule</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New job</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader
        title='New job'
        description='One calendar day. Assign at least one person.'
      />
      <PageCard>
        {customers.length === 0 || people.length === 0 ? (
          <p className='text-paragraph-sm text-text-sub-600'>
            Add people and a customer with a site before creating a job.
          </p>
        ) : (
          <JobForm
            customers={customers}
            sites={sites}
            people={people}
            defaultCustomerId={searchParams.customerId}
            defaultSiteId={searchParams.siteId}
          />
        )}
      </PageCard>
    </div>
  );
}
