import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageCard, PageHeader } from '@/components/dashboard';
import { EditCustomerForm } from '@/components/customer-form';
import { getCustomer, listSitesForCustomer } from '@/lib/queries';
import { requireOffice } from '@/lib/session';

export default async function CustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireOffice();
  const customer = await getCustomer(session.shopId, params.id);
  if (!customer) notFound();
  const sites = await listSitesForCustomer(session.shopId, customer.id);

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader title={customer.name} description='Payer record and sites'>
        <Button asChild variant='outline'>
          <Link href={`/office/customers/${customer.id}/sites/new`}>Add site</Link>
        </Button>
        <Button asChild>
          <Link href={`/office/jobs/new?customerId=${customer.id}`}>New job</Link>
        </Button>
      </PageHeader>

      <div className='grid items-start gap-6 lg:grid-cols-3'>
        <PageCard title='Sites' className='lg:col-span-2' padded={false}>
          {sites.length === 0 ? (
            <p className='px-5 py-8 text-paragraph-sm text-text-sub-600'>
              Add a site (or a Yard / pickup site) before scheduling work.
            </p>
          ) : (
            <ul className='divide-y divide-stroke-soft-200'>
              {sites.map((site) => (
                <li key={site.id}>
                  <Link
                    href={`/office/sites/${site.id}`}
                    className='block px-5 py-3'
                  >
                    <p className='text-label-sm text-text-strong-950'>
                      {site.isYardPickup ? 'Yard / pickup' : site.address911}
                    </p>
                    <p className='text-paragraph-xs text-text-sub-600'>
                      {site.city}, {site.state} {site.zip}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </PageCard>
        <PageCard title='Payer details'>
          <EditCustomerForm customer={customer} />
        </PageCard>
      </div>
    </div>
  );
}
