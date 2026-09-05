'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Field } from '@/components/field';
import {
  createCustomerAction,
  updateCustomerAction,
} from '@/app/actions/customers';
import type { Customer } from '@/db/types';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type='submit' disabled={pending}>
      {pending ? 'Saving…' : label}
    </Button>
  );
}

function Fields({ customer }: { customer?: Customer }) {
  return (
    <>
      <Field label='Payer name' required>
        <Input name='name' required defaultValue={customer?.name} />
      </Field>
      <Field label='Phone'>
        <Input name='phone' type='tel' defaultValue={customer?.phone ?? ''} />
      </Field>
      <Field label='Email'>
        <Input name='email' type='email' defaultValue={customer?.email ?? ''} />
      </Field>
    </>
  );
}

export function NewCustomerForm() {
  const [state, action] = useFormState(createCustomerAction, {});
  return (
    <form action={action} className='flex max-w-none flex-col gap-4'>
      {state?.error ? (
        <Alert variant='destructive'>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <div className='grid gap-4 sm:grid-cols-3'>
        <Fields />
      </div>
      <Submit label='Save customer' />
    </form>
  );
}

export function EditCustomerForm({ customer }: { customer: Customer }) {
  const action = updateCustomerAction.bind(null, customer.id);
  const [state, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className='flex max-w-none flex-col gap-4'>
      {state?.error ? (
        <Alert variant='destructive'>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <div className='flex flex-col gap-4'>
        <Fields customer={customer} />
      </div>
      <Submit label='Save changes' />
    </form>
  );
}
