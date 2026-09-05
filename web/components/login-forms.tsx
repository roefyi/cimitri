'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Field } from '@/components/field';
import { loginAction } from '@/app/actions/auth';

function Submit({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type='submit' disabled={pending} className='w-full' size='lg'>
      {pending ? 'Please wait…' : children}
    </Button>
  );
}

export function LoginForm() {
  const [state, action] = useFormState(loginAction, {});
  return (
    <form action={action} className='flex flex-col gap-4'>
      {state?.error ? (
        <Alert variant='destructive'>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Field label='Email' required>
        <Input name='email' type='email' autoComplete='username' required />
      </Field>
      <Field label='Password' required>
        <Input
          name='password'
          type='password'
          autoComplete='current-password'
          required
        />
      </Field>
      <Submit>Sign in</Submit>
    </form>
  );
}
