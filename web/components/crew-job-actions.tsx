'use client';

import { useState, useTransition } from 'react';
import * as Button from '@/components/ui/button';
import * as Textarea from '@/components/ui/textarea';
import * as Modal from '@/components/ui/modal';
import * as Alert from '@/components/ui/alert';
import { Field } from '@/components/field';
import { crewFlagAction, crewSetCompleteAction } from '@/app/actions/jobs';
import { enqueue, flushQueue } from '@/lib/offline-queue';
import type { JobRow } from '@/lib/types';

export function CrewJobActions({ job }: { job: JobRow }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [note, setNote] = useState(job.flagNote ?? '');
  const canceled = job.status === 'canceled';
  const complete = job.status === 'complete';

  async function setComplete(nextComplete: boolean) {
    setError(null);
    const action = {
      id: `${job.id}-complete-${Date.now()}`,
      kind: 'complete' as const,
      jobId: job.id,
      complete: nextComplete,
    };
    try {
      const result = await crewSetCompleteAction(job.id, nextComplete);
      if (result.error) {
        setError(result.error);
        return;
      }
    } catch {
      await enqueue(action);
      setQueued(true);
    }
  }

  async function submitFlag() {
    setError(null);
    const trimmed = note.trim();
    if (!trimmed) {
      setError('A short note is required.');
      return;
    }
    try {
      const result = await crewFlagAction(job.id, trimmed);
      if (result.error) {
        setError(result.error);
        return;
      }
      setFlagOpen(false);
    } catch {
      await enqueue({
        id: `${job.id}-flag-${Date.now()}`,
        kind: 'flag',
        jobId: job.id,
        note: trimmed,
      });
      setQueued(true);
      setFlagOpen(false);
    }
  }

  return (
    <div className='flex flex-col gap-3'>
      {error ? (
        <Alert.Root variant='lighter' status='error'>
          {error}
        </Alert.Root>
      ) : null}
      {queued ? (
        <Alert.Root variant='lighter' status='warning'>
          Saved on this phone. It will send when you are back online.
          <Button.Root
            type='button'
            mode='stroke'
            size='xsmall'
            className='mt-2'
            onClick={() => {
              startTransition(() => {
                void flushQueue();
              });
            }}
          >
            Retry now
          </Button.Root>
        </Alert.Root>
      ) : null}
      <Button.Root
        type='button'
        disabled={canceled || pending}
        onClick={() => startTransition(() => void setComplete(!complete))}
      >
        {complete ? 'Return to not started' : 'Mark complete'}
      </Button.Root>
      <Button.Root
        type='button'
        variant='error'
        mode='stroke'
        disabled={canceled || pending}
        onClick={() => setFlagOpen(true)}
      >
        Flag an issue
      </Button.Root>

      <Modal.Root open={flagOpen} onOpenChange={setFlagOpen}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Flag an issue</Modal.Title>
            <Modal.Description>
              Office will see this note. A job can be flagged with or without being complete.
            </Modal.Description>
          </Modal.Header>
          <Modal.Body>
            <Field label='What happened' required>
              <Textarea.Root
                simple
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder='Tank cracked on delivery'
              />
            </Field>
          </Modal.Body>
          <Modal.Footer>
            <Button.Root
              type='button'
              variant='neutral'
              mode='stroke'
              onClick={() => setFlagOpen(false)}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type='button'
              variant='error'
              onClick={() => startTransition(() => void submitFlag())}
            >
              Save flag
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
}
