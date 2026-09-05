'use client';

import { useFormState, useFormStatus } from 'react-dom';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Alert from '@/components/ui/alert';
import { Field } from '@/components/field';
import { loginAction } from '@/app/actions/auth';

function Submit({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <Button.Root type='submit' disabled={pending} className='w-full'>
      {pending ? 'Please wait…' : children}
    </Button.Root>
  );
}

export function LoginForm() {
  const [state, action] = useFormState(loginAction, {});
  return (
    <form action={action} className='flex flex-col gap-4'>
      {state?.error ? (
        <Alert.Root variant='lighter' status='error'>
          {state.error}
        </Alert.Root>
      ) : null}
      <Field label='Email' required>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              name='email'
              type='email'
              autoComplete='username'
              required
            />
          </Input.Wrapper>
        </Input.Root>
      </Field>
      <Field label='Password' required>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              name='password'
              type='password'
              autoComplete='current-password'
              required
            />
          </Input.Wrapper>
        </Input.Root>
      </Field>
      <Submit>Sign in</Submit>
    </form>
  );
}
