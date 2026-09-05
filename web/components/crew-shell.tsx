'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { RiCalendar2Line, RiLogoutBoxRLine, RiUserSwitchLine } from '@remixicon/react';
import * as Button from '@/components/ui/button';
import { logoutAction, switchPersonAction } from '@/app/actions/auth';
import ThemeSwitch from '@/components/theme-switch';
import { cn } from '@/utils/cn';

function NavLinks({ compact }: { compact?: boolean }) {
  const pathname = usePathname();
  const href = '/crew';
  const active = pathname === href || pathname.startsWith('/crew/jobs');
  return (
    <nav className={cn('flex', compact ? 'gap-1 overflow-x-auto' : 'flex-col gap-1')}>
      <Link
        href={href}
        className={cn(
          'flex items-center gap-2 rounded-lg text-label-sm transition',
          compact ? 'px-2.5 py-1.5' : 'px-3 py-2',
          active
            ? 'bg-orange-50 text-primary-base'
            : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950',
        )}
      >
        <RiCalendar2Line className='size-5 shrink-0' />
        My jobs
      </Link>
    </nav>
  );
}

export function CrewShell({
  shopName,
  personName,
  children,
}: {
  shopName: string;
  personName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const pickingPerson = pathname === '/crew/who';

  return (
    <div className='flex min-h-0 flex-1'>
      <aside className='hidden w-60 shrink-0 flex-col border-r border-stroke-soft-200 bg-bg-white-0 lg:flex'>
        <div className='flex h-14 items-center px-5'>
          <Link href='/crew' className='text-label-md text-text-strong-950'>
            Cimitri
          </Link>
        </div>
        <div className='flex-1 px-3 py-2'>
          <NavLinks />
        </div>
        <div className='border-t border-stroke-soft-200 px-5 py-4'>
          <p className='truncate text-label-sm text-text-strong-950'>{personName}</p>
          <p className='truncate text-paragraph-xs text-text-sub-600'>{shopName}</p>
          <p className='mt-1 text-paragraph-xs text-text-sub-600'>Crew</p>
        </div>
      </aside>

      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='sticky top-0 z-10 border-b border-stroke-soft-200 bg-bg-white-0'>
          <div className='flex h-14 items-center gap-3 px-5 lg:px-8'>
            <Link href='/crew' className='text-label-md text-text-strong-950 lg:hidden'>
              Cimitri
            </Link>
            <div className='min-w-0 flex-1 lg:hidden'>
              <NavLinks compact />
            </div>
            <div className='hidden min-w-0 flex-1 lg:block'>
              <p className='truncate text-label-sm text-text-strong-950'>{personName}</p>
              <p className='truncate text-paragraph-xs text-text-sub-600'>{shopName}</p>
            </div>
            <ThemeSwitch />
            {pickingPerson ? null : (
              <form action={switchPersonAction}>
                <Button.Root variant='neutral' mode='stroke' size='xsmall' type='submit'>
                  <Button.Icon as={RiUserSwitchLine} />
                  Switch
                </Button.Root>
              </form>
            )}
            <form action={logoutAction}>
              <Button.Root variant='neutral' mode='stroke' size='xsmall' type='submit'>
                <Button.Icon as={RiLogoutBoxRLine} />
                Sign out
              </Button.Root>
            </form>
          </div>
        </header>
        <main className='mx-auto w-full max-w-7xl flex-1 px-5 py-6 lg:px-8'>
          {children}
        </main>
      </div>
    </div>
  );
}
