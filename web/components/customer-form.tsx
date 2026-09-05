'use client';

import { useFormState, useFormStatus } from 'react-dom';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Alert from '@/components/ui/alert';
import { Field } from '@/components/field';
import {
  createCustomerAction,
  updateCustomerAction,
} from '@/app/actions/customers';
import type { Customer } from '@/db/types';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button.Root type='submit' disabled={pending}>
      {pending ? 'Saving…' : label}
    </Button.Root>
  );
}

function Fields({ customer }: { customer?: Customer }) {
  return (
    <>
      <Field label='Payer name' required>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input name='name' required defaultValue={customer?.name} />
          </Input.Wrapper>
        </Input.Root>
      </Field>
      <Field label='Phone'>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input name='phone' type='tel' defaultValue={customer?.phone ?? ''} />
          </Input.Wrapper>
        </Input.Root>
      </Field>
      <Field label='Email'>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              name='email'
              type='email'
              defaultValue={customer?.email ?? ''}
            />
          </Input.Wrapper>
        </Input.Root>
      </Field>
    </>
  );
}

export function NewCustomerForm() {
  const [state, action] = useFormState(createCustomerAction, {});
  return (
    <form action={action} className='flex max-w-none flex-col gap-4'>
      {state?.error ? (
        <Alert.Root variant='lighter' status='error'>
          {state.error}
        </Alert.Root>
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
        <Alert.Root variant='lighter' status='error'>
          {state.error}
        </Alert.Root>
      ) : null}
      <div className='flex flex-col gap-4'>
        <Fields customer={customer} />
      </div>
      <Submit label='Save changes' />
    </form>
  );
}
