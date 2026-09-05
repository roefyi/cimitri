'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Checkbox from '@/components/ui/checkbox';
import * as Alert from '@/components/ui/alert';
import * as Label from '@/components/ui/label';
import { Field } from '@/components/field';
import { createSiteAction, updateSiteAction } from '@/app/actions/sites';
import type { SiteRow } from '@/lib/types';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button.Root type='submit' disabled={pending}>
      {pending ? 'Saving…' : label}
    </Button.Root>
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
        <Checkbox.Root
          checked={yard}
          onCheckedChange={(value) => onYard(value === true)}
        />
        <input type='hidden' name='isYardPickup' value={yard ? 'on' : ''} />
        <Label.Root>Yard / pickup site (no 911 address)</Label.Root>
      </label>
      <Field label='911 address' required>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              name='address911'
              required
              defaultValue={site?.address911 ?? (yard ? 'Yard / pickup' : '')}
              key={yard ? 'yard' : 'addr'}
            />
          </Input.Wrapper>
        </Input.Root>
      </Field>
      <div className='grid gap-4 sm:grid-cols-3'>
        <Field label='City' required>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input name='city' required defaultValue={site?.city} />
            </Input.Wrapper>
          </Input.Root>
        </Field>
        <Field label='State' required>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input name='state' required defaultValue={site?.state ?? 'AL'} />
            </Input.Wrapper>
          </Input.Root>
        </Field>
        <Field label='ZIP' required>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input name='zip' required defaultValue={site?.zip} />
            </Input.Wrapper>
          </Input.Root>
        </Field>
      </div>
      <div className='grid gap-4 sm:grid-cols-3'>
        <Field label='Subdivision'>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input name='subdivision' defaultValue={site?.subdivision ?? ''} />
            </Input.Wrapper>
          </Input.Root>
        </Field>
        <Field label='Lot'>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input name='lot' defaultValue={site?.lot ?? ''} />
            </Input.Wrapper>
          </Input.Root>
        </Field>
        <Field label='Block'>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input name='block' defaultValue={site?.block ?? ''} />
            </Input.Wrapper>
          </Input.Root>
        </Field>
      </div>
      <Field label='Owner / applicant' required>
        <Input.Root>
          <Input.Wrapper>
            <Input.Input
              name='ownerApplicantName'
              required
              defaultValue={site?.ownerApplicantName}
            />
          </Input.Wrapper>
        </Input.Root>
      </Field>
      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label='Site contact'>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                name='siteContactName'
                defaultValue={site?.siteContactName ?? ''}
              />
            </Input.Wrapper>
          </Input.Root>
        </Field>
        <Field label='Site contact phone'>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                name='siteContactPhone'
                type='tel'
                defaultValue={site?.siteContactPhone ?? ''}
              />
            </Input.Wrapper>
          </Input.Root>
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
        <Alert.Root variant='lighter' status='error'>
          {state.error}
        </Alert.Root>
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
        <Alert.Root variant='lighter' status='error'>
          {state.error}
        </Alert.Root>
      ) : null}
      <SiteFields site={site} yard={yard} onYard={setYard} />
      <Submit label='Save changes' />
    </form>
  );
}
