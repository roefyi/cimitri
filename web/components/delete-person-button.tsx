'use client';

import { Button } from '@/components/ui/button';
import { deletePersonAction } from '@/app/actions/people';
import { useState, useTransition } from 'react';

export function DeletePersonButton({ personId }: { personId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className='flex flex-col items-end gap-1'>
      <Button
        type='button'
        variant='destructive'
        size='xs'
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await deletePersonAction(personId);
            setError(result.error ?? null);
          })
        }
      >
        Remove
      </Button>
      {error ? <p className='text-paragraph-xs text-destructive'>{error}</p> : null}
    </div>
  );
}
