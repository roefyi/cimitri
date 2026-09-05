import Link from 'next/link';
import { PageCard, PageHeader } from '@/components/dashboard';
import { NewCustomerForm } from '@/components/customer-form';

export default function NewCustomerPage() {
  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='New customer'
        description='This is the payer. Add a site next for the 911 address and owner/applicant.'
      >
        <Link href='/office/customers' className='text-label-sm text-text-sub-600'>
          Back to customers
        </Link>
      </PageHeader>
      <PageCard>
        <NewCustomerForm />
      </PageCard>
    </div>
  );
}
