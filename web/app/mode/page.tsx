import { AuthHeader } from '@/components/app-header';
import * as Button from '@/components/ui/button';
import { PageCard } from '@/components/dashboard';
import { setModeAction } from '@/app/actions/auth';
import { requireSession } from '@/lib/session';

export default async function ModePage() {
  const session = await requireSession();
  return (
    <>
      <AuthHeader />
      <main className='mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-12'>
        <p className='text-paragraph-sm text-text-sub-600'>{session.shopName}</p>
        <h1 className='mt-1 text-title-h5'>Who is using this device?</h1>
        <p className='mt-2 max-w-xl text-paragraph-sm text-text-sub-600'>
          This choice stays until you sign out.
        </p>
        <div className='mt-8 grid gap-4 sm:grid-cols-2'>
          <PageCard title='Office'>
            <p className='text-paragraph-sm text-text-sub-600'>
              Company schedule, customers, people, and CEP-5 drafts.
            </p>
            <form action={setModeAction.bind(null, 'office')} className='mt-4'>
              <Button.Root type='submit' className='w-full'>
                Continue as office
              </Button.Root>
            </form>
          </PageCard>
          <PageCard title='Crew'>
            <p className='text-paragraph-sm text-text-sub-600'>
              Only the jobs assigned to the person you pick next.
            </p>
            <form action={setModeAction.bind(null, 'crew')} className='mt-4'>
              <Button.Root type='submit' variant='neutral' mode='stroke' className='w-full'>
                Continue as crew
              </Button.Root>
            </form>
          </PageCard>
        </div>
      </main>
    </>
  );
}
