import { Label } from '@/components/ui/label';

export function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <Label>
        {label}
        {required ? <span className='text-destructive'> *</span> : null}
      </Label>
      {children}
      {error ? (
        <p className='text-paragraph-xs text-destructive'>{error}</p>
      ) : hint ? (
        <p className='text-paragraph-xs text-muted-foreground'>{hint}</p>
      ) : null}
    </div>
  );
}
