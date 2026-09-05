'use client';

import * as Button from '@/components/ui/button';
import { deletePersonAction } from '@/app/actions/people';
import { useState, useTransition } from 'react';

export function DeletePersonButton({ personId }: { personId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className='flex flex-col items-end gap-1'>
      <Button.Root
        type='button'
        variant='error'
        mode='stroke'
        size='xsmall'
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await deletePersonAction(personId);
            setError(result.error ?? null);
          })
        }
      >
        Remove
      </Button.Root>
      {error ? <p className='text-paragraph-xs text-error-base'>{error}</p> : null}
    </div>
  );
}
