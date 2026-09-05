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
import { PageCard, PageHeader } from '@/components/dashboard';
import { listCustomers } from '@/lib/queries';
import { requireOffice } from '@/lib/session';

export default async function CustomersPage() {
  const session = await requireOffice();
  const customers = await listCustomers(session.shopId);

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader title='Customers' description='Payers. Sites and owner/applicant live on each site.'>
        <Button asChild>
          <Link href='/office/customers/new'>New customer</Link>
        </Button>
      </PageHeader>
      <PageCard padded={false}>
        {customers.length === 0 ? (
          <p className='px-5 py-8 text-paragraph-sm text-muted-foreground'>
            No customers yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Link
                      href={`/office/customers/${customer.id}`}
                      className='text-label-sm'
                    >
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell>{customer.phone || '—'}</TableCell>
                  <TableCell>{customer.email || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </PageCard>
    </div>
  );
}
