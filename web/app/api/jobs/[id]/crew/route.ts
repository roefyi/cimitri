import { NextResponse } from 'next/server';
import { crewMaySetStatus } from '@/db/types';
import { readSession } from '@/lib/auth';
import {
  getJob,
  personIsAssigned,
  setJobFlag,
  setJobStatus,
} from '@/lib/queries';

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await readSession();
  if (!session?.personId || session.mode !== 'crew') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const assigned = await personIsAssigned(params.id, session.personId);
  if (!assigned) {
    return NextResponse.json({ error: 'Not assigned' }, { status: 403 });
  }
  const job = await getJob(session.shopId, params.id);
  if (!job) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const body = (await request.json()) as {
    kind?: string;
    complete?: boolean;
    note?: string;
  };
  if (body.kind === 'complete') {
    const next = body.complete ? 'complete' : 'not_started';
    if (!crewMaySetStatus(job.status, next)) {
      return NextResponse.json({ error: 'Cannot update' }, { status: 409 });
    }
    await setJobStatus(session.shopId, job.id, next);
    return NextResponse.json({ ok: true });
  }
  if (body.kind === 'flag') {
    const note = String(body.note ?? '').trim();
    if (!note) {
      return NextResponse.json({ error: 'Note required' }, { status: 400 });
    }
    if (job.status === 'canceled') {
      return NextResponse.json({ error: 'Cannot update' }, { status: 409 });
    }
    await setJobFlag(session.shopId, job.id, true, note);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
