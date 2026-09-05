'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Building2, CalendarDays, LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/app/actions/auth';
import ThemeSwitch from '@/components/theme-switch';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/office/jobs', label: 'Schedule', icon: CalendarDays },
  { href: '/office/customers', label: 'Customers', icon: Building2 },
  { href: '/office/people', label: 'People', icon: Users },
];

function NavLinks({ compact }: { compact?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className={cn('flex', compact ? 'gap-1 overflow-x-auto' : 'flex-col gap-1')}>
      {LINKS.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-2 rounded-lg text-label-sm transition',
              compact ? 'px-2.5 py-1.5' : 'px-3 py-2',
              active
                ? 'bg-accent text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className='size-5 shrink-0' />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SessionActions() {
  return (
    <div className='flex items-center gap-2'>
      <ThemeSwitch />
      <form action={logoutAction}>
        <Button variant='outline' size='xs' type='submit'>
          <LogOut />
          Sign out
        </Button>
      </form>
    </div>
  );
}

export function OfficeShell({
  shopName,
  children,
}: {
  shopName: string;
  children: ReactNode;
}) {
  return (
    <div className='flex min-h-0 flex-1'>
      <aside className='hidden w-60 shrink-0 flex-col border-r bg-sidebar print:hidden lg:flex'>
        <div className='flex h-14 items-center px-5'>
          <Link href='/office/jobs' className='text-label-md'>
            Cimitri
          </Link>
        </div>
        <div className='flex-1 px-3 py-2'>
          <NavLinks />
        </div>
        <div className='border-t px-5 py-4'>
          <p className='truncate text-label-sm'>{shopName}</p>
          <p className='text-paragraph-xs text-muted-foreground'>Office</p>
        </div>
      </aside>

      <div className='flex min-w-0 flex-1 flex-col'>
        <header className='sticky top-0 z-10 border-b bg-card print:hidden'>
          <div className='flex h-14 items-center gap-3 px-5 lg:px-8'>
            <Link href='/office/jobs' className='text-label-md lg:hidden'>
              Cimitri
            </Link>
            <div className='min-w-0 flex-1 lg:hidden'>
              <NavLinks compact />
            </div>
            <p className='hidden min-w-0 flex-1 truncate text-paragraph-sm text-muted-foreground lg:block'>
              {shopName}
            </p>
            <SessionActions />
          </div>
        </header>
        <main className='mx-auto w-full max-w-7xl flex-1 px-5 py-6 lg:px-8'>
          {children}
        </main>
      </div>
    </div>
  );
}
