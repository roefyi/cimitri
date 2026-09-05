'use client';

import { useFormState, useFormStatus } from 'react-dom';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import { Field } from '@/components/field';
import { createPersonAction } from '@/app/actions/people';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button.Root type='submit' disabled={pending}>
      {pending ? 'Saving…' : 'Add person'}
    </Button.Root>
  );
}

export function PersonForm() {
  const [state, action] = useFormState(createPersonAction, {});
  return (
    <form action={action} className='flex flex-col gap-3'>
      <div className='flex-1'>
        <Field label='Name' required error={state?.error}>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input name='name' required placeholder='First and last name' />
            </Input.Wrapper>
          </Input.Root>
        </Field>
      </div>
      <Submit />
    </form>
  );
}
