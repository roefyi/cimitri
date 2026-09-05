import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageCard, PageHeader } from '@/components/dashboard';
import { NewSiteForm } from '@/components/site-form';
import { getCustomer } from '@/lib/queries';
import { requireOffice } from '@/lib/session';

export default async function NewSitePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireOffice();
  const customer = await getCustomer(session.shopId, params.id);
  if (!customer) notFound();

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='New site'
        description={`911 address, owner/applicant, and site contact for ${customer.name}.`}
      >
        <Link
          href={`/office/customers/${customer.id}`}
          className='text-label-sm text-text-sub-600'
        >
          Back to {customer.name}
        </Link>
      </PageHeader>
      <PageCard>
        <NewSiteForm customerId={customer.id} />
      </PageCard>
    </div>
  );
}
