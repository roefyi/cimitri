import type { ReactNode } from 'react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
          <p className='mt-1 text-paragraph-sm text-muted-foreground'>{description}</p>
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
    <Card className={cn(className)}>
      {title || action ? (
        <CardHeader className='border-b'>
          {title ? <CardTitle>{title}</CardTitle> : <span />}
          {action ? <CardAction>{action}</CardAction> : null}
        </CardHeader>
      ) : null}
      <CardContent className={padded ? '' : 'px-0'}>{children}</CardContent>
    </Card>
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
    <Card>
      <CardContent>
        <p className='text-paragraph-xs text-muted-foreground'>{label}</p>
        <p className='mt-1 text-title-h5 tabular-nums'>{value}</p>
        {hint ? (
          <p className='mt-1 text-paragraph-xs text-muted-foreground'>{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
