'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {queued ? (
        <Alert>
          <AlertDescription>
            Saved on this phone. It will send when you are back online.
            <Button
              type='button'
              variant='outline'
              size='xs'
              className='mt-2'
              onClick={() => {
                startTransition(() => {
                  void flushQueue();
                });
              }}
            >
              Retry now
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      <Button
        type='button'
        disabled={canceled || pending}
        onClick={() => startTransition(() => void setComplete(!complete))}
      >
        {complete ? 'Return to not started' : 'Mark complete'}
      </Button>
      <Button
        type='button'
        variant='destructive'
        disabled={canceled || pending}
        onClick={() => setFlagOpen(true)}
      >
        Flag an issue
      </Button>

      <Dialog open={flagOpen} onOpenChange={setFlagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag an issue</DialogTitle>
            <DialogDescription>
              Office will see this note. A job can be flagged with or without being complete.
            </DialogDescription>
          </DialogHeader>
          <Field label='What happened' required>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder='Tank cracked on delivery'
            />
          </Field>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setFlagOpen(false)}>
              Cancel
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={() => startTransition(() => void submitFlag())}
            >
              Save flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
