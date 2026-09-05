'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import * as Button from '@/components/ui/button';
import * as Textarea from '@/components/ui/textarea';
import * as FileUpload from '@/components/ui/file-upload';
import * as Alert from '@/components/ui/alert';
import { Field } from '@/components/field';
import { addJobNoteAction } from '@/app/actions/jobs';
import { RiUploadCloud2Line } from '@remixicon/react';
import type { JobNote, JobPhoto } from '@/db/types';

function NoteSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button.Root type='submit' size='small' disabled={pending}>
      {pending ? 'Saving…' : 'Add note'}
    </Button.Root>
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
        <h2 className='text-label-md text-text-strong-950'>Photos</h2>
        <FileUpload.Root>
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
          <FileUpload.Icon as={RiUploadCloud2Line} />
          <p className='text-paragraph-sm text-text-sub-600'>
            {uploading ? 'Uploading…' : 'Tap to add photos for the CEP-5 draft'}
          </p>
          <FileUpload.Button>Choose photos</FileUpload.Button>
        </FileUpload.Root>
        {uploadError ? (
          <Alert.Root variant='lighter' status='error'>
            {uploadError}
          </Alert.Root>
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
          <p className='text-paragraph-sm text-text-sub-600'>No photos yet.</p>
        )}
      </section>

      <section className='flex flex-col gap-3'>
        <h2 className='text-label-md text-text-strong-950'>Notes</h2>
        {notes.map((note) => (
          <p
            key={note.id}
            className='rounded-xl bg-bg-white-0 p-3 text-paragraph-sm text-text-strong-950 ring-1 ring-stroke-soft-200'
          >
            {note.body}
          </p>
        ))}
        <form action={formAction} className='flex flex-col gap-2'>
          {state?.error ? (
            <Alert.Root variant='lighter' status='error'>
              {state.error}
            </Alert.Root>
          ) : null}
          <Field label='Add a note'>
            <Textarea.Root name='body' simple required placeholder='What the form needs from the field' />
          </Field>
          <NoteSubmit />
        </form>
      </section>
    </div>
  );
}
