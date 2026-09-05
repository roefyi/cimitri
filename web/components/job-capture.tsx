'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Field } from '@/components/field';
import { addJobNoteAction } from '@/app/actions/jobs';
import type { JobNote, JobPhoto } from '@/db/types';

function NoteSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type='submit' size='sm' disabled={pending}>
      {pending ? 'Saving…' : 'Add note'}
    </Button>
  );
}

export function JobCapture({
  jobId,
  notes,
  photos,
}: {
  jobId: string;
  notes: JobNote[];
  photos: JobPhoto[];
}) {
  const router = useRouter();
  const action = addJobNoteAction.bind(null, jobId);
  const [state, formAction] = useFormState(action, {});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setUploadError(null);
    try {
      for (const file of Array.from(files)) {
        const data = new FormData();
        data.set('file', file);
        const res = await fetch(`/api/jobs/${jobId}/photos`, {
          method: 'POST',
          body: data,
        });
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setUploadError(json.error ?? 'Upload failed');
          break;
        }
      }
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <section className='flex flex-col gap-3'>
        <h2 className='text-label-md'>Photos</h2>
        <label className='flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center'>
          <input
            type='file'
            accept='image/*'
            capture='environment'
            multiple
            className='sr-only'
            onChange={(event) => {
              void onFiles(event.target.files);
              event.target.value = '';
            }}
          />
          <Upload className='size-6 text-muted-foreground' />
          <p className='text-paragraph-sm text-muted-foreground'>
            {uploading ? 'Uploading…' : 'Tap to add photos for the CEP-5 draft'}
          </p>
          <Button type='button' variant='outline' size='sm' asChild>
            <span>Choose photos</span>
          </Button>
        </label>
        {uploadError ? (
          <Alert variant='destructive'>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        ) : null}
        {photos.length ? (
          <div className='grid grid-cols-3 gap-2'>
            {photos.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={photo.storageUrl}
                alt='Job photo'
                className='h-24 w-full rounded-lg object-cover'
              />
            ))}
          </div>
        ) : (
          <p className='text-paragraph-sm text-muted-foreground'>No photos yet.</p>
        )}
      </section>

      <section className='flex flex-col gap-3'>
        <h2 className='text-label-md'>Notes</h2>
        {notes.map((note) => (
          <p
            key={note.id}
            className='rounded-xl bg-card p-3 text-paragraph-sm ring-1 ring-border'
          >
            {note.body}
          </p>
        ))}
        <form action={formAction} className='flex flex-col gap-2'>
          {state?.error ? (
            <Alert variant='destructive'>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <Field label='Add a note'>
            <Textarea name='body' required placeholder='What the form needs from the field' />
          </Field>
          <NoteSubmit />
        </form>
      </section>
    </div>
  );
}
