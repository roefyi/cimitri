import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className='flex flex-wrap items-start justify-between gap-3'>
      <div className='min-w-0'>
        <h1 className='text-title-h5'>{title}</h1>
        {description ? (
          <p className='mt-1 text-paragraph-sm text-text-sub-600'>{description}</p>
        ) : null}
      </div>
      {children ? <div className='flex flex-wrap items-center gap-2'>{children}</div> : null}
    </div>
  );
}

export function PageCard({
  title,
  action,
  padded = true,
  className,
  children,
}: {
  title?: string;
  action?: ReactNode;
  padded?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-20 bg-bg-white-0 shadow-regular-xs ring-1 ring-stroke-soft-200',
        className,
      )}
    >
      {title || action ? (
        <div className='flex items-center justify-between gap-3 border-b border-stroke-soft-200 px-5 py-4'>
          {title ? <h2 className='text-label-md text-text-strong-950'>{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className='rounded-20 bg-bg-white-0 p-4 shadow-regular-xs ring-1 ring-stroke-soft-200'>
      <p className='text-paragraph-xs text-text-sub-600'>{label}</p>
      <p className='mt-1 text-title-h5 tabular-nums text-text-strong-950'>{value}</p>
      {hint ? (
        <p className='mt-1 text-paragraph-xs text-text-soft-400'>{hint}</p>
      ) : null}
    </div>
  );
}
