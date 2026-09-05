import { redirect } from 'next/navigation';
import { AuthHeader } from '@/components/app-header';
import { LoginForm } from '@/components/login-forms';
import { readSession } from '@/lib/auth';

export default async function LoginPage() {
  const session = await readSession();
  if (session) redirect('/');

  return (
    <div className='flex min-h-0 flex-1'>
      <div className='hidden w-[42%] flex-col justify-between border-r border-stroke-soft-200 bg-bg-white-0 p-10 lg:flex'>
        <p className='text-label-md text-text-strong-950'>Cimitri</p>
        <div>
          <h1 className='max-w-sm text-title-h4 text-text-strong-950'>
            Shop schedule, crew, and CEP-5 drafts in one place.
          </h1>
          <p className='mt-3 max-w-sm text-paragraph-sm text-text-sub-600'>
            Office plans the week. Crew works the day they are assigned.
          </p>
        </div>
        <p className='text-paragraph-xs text-text-soft-400'>
          Scheduling for regulated trades
        </p>
      </div>
      <div className='flex min-w-0 flex-1 flex-col'>
        <div className='lg:hidden'>
          <AuthHeader />
        </div>
        <main className='mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-5 py-12'>
          <h1 className='text-title-h5'>Sign in</h1>
          <p className='mt-2 text-paragraph-sm text-text-sub-600'>
            Type any email and password. Nothing is checked yet.
          </p>
          <div className='mt-8'>
            <LoginForm />
          </div>
        </main>
      </div>
    </div>
  );
}
