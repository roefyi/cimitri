'use client';

import { useMemo, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Select from '@/components/ui/select';
import * as Checkbox from '@/components/ui/checkbox';
import * as Alert from '@/components/ui/alert';
import * as Label from '@/components/ui/label';
import { Field } from '@/components/field';
import { createJobAction, updateJobAction } from '@/app/actions/jobs';
import { jobTypeOptions } from '@/lib/job-catalog';
import { jobTypeNeedsOssFields, type JobType } from '@/db/types';
import { todayIso } from '@/lib/dates';
import type { CustomerRow, JobRow, PersonRow, SiteRow } from '@/lib/types';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button.Root type='submit' disabled={pending}>
      {pending ? 'Saving…' : label}
    </Button.Root>
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

  const bound = job
    ? updateJobAction.bind(null, job.id)
    : createJobAction;
  const [state, formAction] = useFormState(bound, {});
  const oss = type !== '' && jobTypeNeedsOssFields(type);

  return (
    <form action={formAction} className='flex w-full flex-col gap-5'>
      {state?.error ? (
        <Alert.Root variant='lighter' status='error'>
          {state.error}
        </Alert.Root>
      ) : null}

      <div className='grid gap-4 sm:grid-cols-3'>
      <Field label='Customer (payer)' required>
        <Select.Root
          value={customerId || undefined}
          onValueChange={(value) => {
            setCustomerId(value);
            setSiteId('');
          }}
        >
          <Select.Trigger>
            <Select.Value placeholder='Choose customer' />
          </Select.Trigger>
          <Select.Content>
            {customers.map((customer) => (
              <Select.Item key={customer.id} value={customer.id}>
                {customer.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <input type='hidden' name='customerId' value={customerId} />
      </Field>

      <Field label='Site' required>
        <Select.Root
          value={siteId || undefined}
          onValueChange={setSiteId}
          disabled={!customerId}
        >
          <Select.Trigger>
            <Select.Value placeholder={customerId ? 'Choose site' : 'Choose a customer first'} />
          </Select.Trigger>
          <Select.Content>
            {customerSites.map((site) => (
              <Select.Item key={site.id} value={site.id}>
                {site.isYardPickup ? 'Yard / pickup' : site.address911}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <input type='hidden' name='siteId' value={siteId} />
      </Field>

      <Field label='Job type' required>
        <Select.Root
          value={type || undefined}
          onValueChange={(value) => setType(value as JobType)}
        >
          <Select.Trigger>
            <Select.Value placeholder='Choose type' />
          </Select.Trigger>
          <Select.Content>
            {jobTypeOptions().map((option) => (
              <Select.Item key={option.id} value={option.id}>
                {option.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <input type='hidden' name='type' value={type} />
      </Field>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label='Date' required>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                name='scheduledDate'
                type='date'
                required
                defaultValue={job?.scheduledDate ?? todayIso()}
              />
            </Input.Wrapper>
          </Input.Root>
        </Field>
        <Field label='Time' hint='Optional'>
          <Input.Root>
            <Input.Wrapper>
              <Input.Input
                name='scheduledTime'
                type='time'
                defaultValue={job?.scheduledTime ?? ''}
              />
            </Input.Wrapper>
          </Input.Root>
        </Field>
      </div>

      <fieldset className='flex flex-col gap-2'>
        <Label.Root>
          Assigned people
          <Label.Asterisk />
        </Label.Root>
        {people.length === 0 ? (
          <p className='text-paragraph-sm text-text-sub-600'>
            Add people before creating a job.
          </p>
        ) : (
          <div className='grid gap-2 sm:grid-cols-2'>
          {people.map((person) => {
            const checked = personIds.includes(person.id);
            return (
              <label key={person.id} className='flex items-center gap-2'>
                <Checkbox.Root
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
        <div className='grid gap-4 rounded-20 bg-bg-weak-50 p-4 sm:grid-cols-3'>
          <p className='text-label-sm text-text-strong-950 sm:col-span-3'>
            Alabama OSS fields
          </p>
          <Field label='Permit number' required>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  name='permitNumber'
                  required={oss}
                  defaultValue={job?.permitNumber ?? ''}
                />
              </Input.Wrapper>
            </Input.Root>
          </Field>
          <Field label='Tank' required>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input name='tank' required={oss} defaultValue={job?.tank ?? ''} />
              </Input.Wrapper>
            </Input.Root>
          </Field>
          <Field label='System type' required>
            <Input.Root>
              <Input.Wrapper>
                <Input.Input
                  name='systemType'
                  required={oss}
                  defaultValue={job?.systemType ?? ''}
                />
              </Input.Wrapper>
            </Input.Root>
          </Field>
        </div>
      ) : null}

      <Submit label={job ? 'Save job' : 'Create job'} />
    </form>
  );
}
