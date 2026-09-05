import * as Label from '@/components/ui/label';
import * as Hint from '@/components/ui/hint';

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
      <Label.Root>
        {label}
        {required ? <Label.Asterisk /> : null}
      </Label.Root>
      {children}
      {error ? (
        <Hint.Root hasError>{error}</Hint.Root>
      ) : hint ? (
        <Hint.Root>{hint}</Hint.Root>
      ) : null}
    </div>
  );
}
