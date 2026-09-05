'use client';

import { useMemo, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Field } from '@/components/field';
import { createJobAction, updateJobAction } from '@/app/actions/jobs';
import { jobTypeOptions } from '@/lib/job-catalog';
import { jobTypeNeedsOssFields, type JobType } from '@/db/types';
import { todayIso } from '@/lib/dates';
import type { CustomerRow, JobRow, PersonRow, SiteRow } from '@/lib/types';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type='submit' disabled={pending}>
      {pending ? 'Saving…' : label}
    </Button>
  );
}

export function JobForm({
  customers,
  sites,
  people,
  job,
  defaultCustomerId,
  defaultSiteId,
}: {
  customers: CustomerRow[];
  sites: SiteRow[];
  people: PersonRow[];
  job?: JobRow;
  defaultCustomerId?: string;
  defaultSiteId?: string;
}) {
  const [customerId, setCustomerId] = useState(
    job?.customerId ?? defaultCustomerId ?? '',
  );
  const [siteId, setSiteId] = useState(job?.siteId ?? defaultSiteId ?? '');
  const [type, setType] = useState<JobType | ''>(job?.type ?? '');
  const [personIds, setPersonIds] = useState<string[]>(
    job?.assignees.map((a) => a.id) ?? [],
  );

  const customerSites = useMemo(
    () => sites.filter((site) => site.customerId === customerId),
    [sites, customerId],
  );

  const bound = job ? updateJobAction.bind(null, job.id) : createJobAction;
  const [state, formAction] = useFormState(bound, {});
  const oss = type !== '' && jobTypeNeedsOssFields(type);

  return (
    <form action={formAction} className='flex w-full flex-col gap-5'>
      {state?.error ? (
        <Alert variant='destructive'>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className='grid gap-4 sm:grid-cols-3'>
        <Field label='Customer (payer)' required>
          <Select
            value={customerId || undefined}
            onValueChange={(value) => {
              setCustomerId(value);
              setSiteId('');
            }}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Choose customer' />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type='hidden' name='customerId' value={customerId} />
        </Field>

        <Field label='Site' required>
          <Select
            value={siteId || undefined}
            onValueChange={setSiteId}
            disabled={!customerId}
          >
            <SelectTrigger className='w-full'>
              <SelectValue
                placeholder={customerId ? 'Choose site' : 'Choose a customer first'}
              />
            </SelectTrigger>
            <SelectContent>
              {customerSites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.isYardPickup ? 'Yard / pickup' : site.address911}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type='hidden' name='siteId' value={siteId} />
        </Field>

        <Field label='Job type' required>
          <Select
            value={type || undefined}
            onValueChange={(value) => setType(value as JobType)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Choose type' />
            </SelectTrigger>
            <SelectContent>
              {jobTypeOptions().map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type='hidden' name='type' value={type} />
        </Field>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label='Date' required>
          <Input
            name='scheduledDate'
            type='date'
            required
            defaultValue={job?.scheduledDate ?? todayIso()}
          />
        </Field>
        <Field label='Time' hint='Optional'>
          <Input
            name='scheduledTime'
            type='time'
            defaultValue={job?.scheduledTime ?? ''}
          />
        </Field>
      </div>

      <fieldset className='flex flex-col gap-2'>
        <Label>
          Assigned people
          <span className='text-destructive'> *</span>
        </Label>
        {people.length === 0 ? (
          <p className='text-paragraph-sm text-muted-foreground'>
            Add people before creating a job.
          </p>
        ) : (
          <div className='grid gap-2 sm:grid-cols-2'>
            {people.map((person) => {
              const checked = personIds.includes(person.id);
              return (
                <label key={person.id} className='flex items-center gap-2'>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => {
                      setPersonIds((current) =>
                        value === true
                          ? [...current, person.id]
                          : current.filter((id) => id !== person.id),
                      );
                    }}
                  />
                  <span className='text-paragraph-sm'>{person.name}</span>
                  {checked ? (
                    <input type='hidden' name='personIds' value={person.id} />
                  ) : null}
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      {oss ? (
        <div className='grid gap-4 rounded-xl bg-muted p-4 sm:grid-cols-3'>
          <p className='text-label-sm sm:col-span-3'>Alabama OSS fields</p>
          <Field label='Permit number' required>
            <Input
              name='permitNumber'
              required={oss}
              defaultValue={job?.permitNumber ?? ''}
            />
          </Field>
          <Field label='Tank' required>
            <Input name='tank' required={oss} defaultValue={job?.tank ?? ''} />
          </Field>
          <Field label='System type' required>
            <Input
              name='systemType'
              required={oss}
              defaultValue={job?.systemType ?? ''}
            />
          </Field>
        </div>
      ) : null}

      <Submit label={job ? 'Save job' : 'Create job'} />
    </form>
  );
}
