'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Field } from '@/components/field';
import { createSiteAction, updateSiteAction } from '@/app/actions/sites';
import type { SiteRow } from '@/lib/types';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type='submit' disabled={pending}>
      {pending ? 'Saving…' : label}
    </Button>
  );
}

function SiteFields({
  site,
  yard,
  onYard,
}: {
  site?: SiteRow;
  yard: boolean;
  onYard: (value: boolean) => void;
}) {
  return (
    <>
      <label className='flex items-center gap-2'>
        <Checkbox
          checked={yard}
          onCheckedChange={(value) => onYard(value === true)}
        />
        <input type='hidden' name='isYardPickup' value={yard ? 'on' : ''} />
        <Label>Yard / pickup site (no 911 address)</Label>
      </label>
      <Field label='911 address' required>
        <Input
          name='address911'
          required
          defaultValue={site?.address911 ?? (yard ? 'Yard / pickup' : '')}
          key={yard ? 'yard' : 'addr'}
        />
      </Field>
      <div className='grid gap-4 sm:grid-cols-3'>
        <Field label='City' required>
          <Input name='city' required defaultValue={site?.city} />
        </Field>
        <Field label='State' required>
          <Input name='state' required defaultValue={site?.state ?? 'AL'} />
        </Field>
        <Field label='ZIP' required>
          <Input name='zip' required defaultValue={site?.zip} />
        </Field>
      </div>
      <div className='grid gap-4 sm:grid-cols-3'>
        <Field label='Subdivision'>
          <Input name='subdivision' defaultValue={site?.subdivision ?? ''} />
        </Field>
        <Field label='Lot'>
          <Input name='lot' defaultValue={site?.lot ?? ''} />
        </Field>
        <Field label='Block'>
          <Input name='block' defaultValue={site?.block ?? ''} />
        </Field>
      </div>
      <Field label='Owner / applicant' required>
        <Input
          name='ownerApplicantName'
          required
          defaultValue={site?.ownerApplicantName}
        />
      </Field>
      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label='Site contact'>
          <Input name='siteContactName' defaultValue={site?.siteContactName ?? ''} />
        </Field>
        <Field label='Site contact phone'>
          <Input
            name='siteContactPhone'
            type='tel'
            defaultValue={site?.siteContactPhone ?? ''}
          />
        </Field>
      </div>
    </>
  );
}

export function NewSiteForm({ customerId }: { customerId: string }) {
  const [yard, setYard] = useState(false);
  const action = createSiteAction.bind(null, customerId);
  const [state, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className='flex w-full flex-col gap-4'>
      {state?.error ? (
        <Alert variant='destructive'>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <SiteFields yard={yard} onYard={setYard} />
      <Submit label='Save site' />
    </form>
  );
}

export function EditSiteForm({ site }: { site: SiteRow }) {
  const [yard, setYard] = useState(site.isYardPickup);
  const action = updateSiteAction.bind(null, site.id, site.customerId);
  const [state, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className='flex w-full flex-col gap-4'>
      {state?.error ? (
        <Alert variant='destructive'>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <SiteFields site={site} yard={yard} onYard={setYard} />
      <Submit label='Save changes' />
    </form>
  );
}
