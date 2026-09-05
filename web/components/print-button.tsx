'use client';

import * as Button from '@/components/ui/button';

export function PrintButton({ children }: { children: string }) {
  return (
    <Button.Root type='button' onClick={() => window.print()}>
      {children}
    </Button.Root>
  );
}
