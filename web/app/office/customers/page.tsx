import Link from 'next/link';
import * as Button from '@/components/ui/button';
import * as Table from '@/components/ui/table';
import { PageCard, PageHeader } from '@/components/dashboard';
import { listCustomers } from '@/lib/queries';
import { requireOffice } from '@/lib/session';

export default async function CustomersPage() {
  const session = await requireOffice();
  const customers = await listCustomers(session.shopId);

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader title='Customers' description='Payers. Sites and owner/applicant live on each site.'>
        <Button.Root asChild>
          <Link href='/office/customers/new'>New customer</Link>
        </Button.Root>
      </PageHeader>
      <PageCard padded={false}>
        {customers.length === 0 ? (
          <p className='px-5 py-8 text-paragraph-sm text-text-sub-600'>
            No customers yet.
          </p>
        ) : (
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Phone</Table.Head>
                <Table.Head>Email</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {customers.map((customer) => (
                <Table.Row key={customer.id}>
                  <Table.Cell>
                    <Link
                      href={`/office/customers/${customer.id}`}
                      className='text-label-sm'
                    >
                      {customer.name}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{customer.phone || '—'}</Table.Cell>
                  <Table.Cell>{customer.email || '—'}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </PageCard>
    </div>
  );
}
