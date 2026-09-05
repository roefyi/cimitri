import { NextResponse } from 'next/server';
import { jobTypeNeedsOssFields } from '@/db/types';
import { readSession } from '@/lib/auth';
import { addPhoto, getJob, personIsAssigned } from '@/lib/queries';

const MAX_BYTES = 2_000_000;
const MAX_PHOTOS = 12;

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const job = await getJob(session.shopId, params.id);
  if (!job) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!jobTypeNeedsOssFields(job.type)) {
    return NextResponse.json({ error: 'Photos are only for CEP-5 jobs' }, { status: 400 });
  }
  if (session.mode === 'crew') {
    if (!session.personId || !(await personIsAssigned(job.id, session.personId))) {
      return NextResponse.json({ error: 'Not assigned' }, { status: 403 });
    }
  } else if (session.mode !== 'office') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (job.photos.length >= MAX_PHOTOS) {
    return NextResponse.json({ error: 'Photo limit reached' }, { status: 400 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Choose a photo' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Photo must be under 2 MB' }, { status: 400 });
  }
  const type = file.type || 'image/jpeg';
  if (!type.startsWith('image/')) {
    return NextResponse.json({ error: 'Images only' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let storageUrl: string;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`jobs/${job.id}/${Date.now()}-${file.name}`, buffer, {
      access: 'public',
      contentType: type,
    });
    storageUrl = blob.url;
  } else {
    storageUrl = `data:${type};base64,${buffer.toString('base64')}`;
  }
  await addPhoto(job.id, storageUrl);
  return NextResponse.json({ ok: true });
}
