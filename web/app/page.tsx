import * as Button from '@/components/ui/button';
import * as Badge from '@/components/ui/badge';

export default function Home() {
  return (
    <div className='mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-16'>
      <Badge.Root variant='lighter' color='orange' className='w-fit'>
        Scaffold
      </Badge.Root>
      <h1 className='mt-4 text-title-h4 text-text-strong-950'>Cimitri</h1>
      <p className='mt-2 text-paragraph-md text-text-sub-600'>
        Everything you need, nothing you don't.
      </p>
      <div className='mt-8 flex flex-wrap gap-3'>
        <Button.Root variant='primary'>Primary #{'E56515'}</Button.Root>
        <Button.Root variant='primary' mode='stroke'>
          Secondary
        </Button.Root>
      </div>
      <ul className='mt-10 space-y-2 text-paragraph-sm text-text-sub-600'>
        <li>Background {`#F8F8F8`}</li>
        <li>Muted text {`#919599`}</li>
        <li>Borders {`#CDCDCB`}</li>
      </ul>
    </div>
  );
}
