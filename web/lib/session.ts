import { redirect } from 'next/navigation';
import { readSession, type SessionPayload } from '@/lib/auth';

export async function requireSession(): Promise<SessionPayload> {
  const session = await readSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireOffice(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.mode !== 'office') redirect('/mode');
  return session;
}

export async function requireCrewPerson(): Promise<
  SessionPayload & { personId: string; personName: string }
> {
  const session = await requireSession();
  if (session.mode !== 'crew') redirect('/mode');
  if (!session.personId || !session.personName) redirect('/crew/who');
  return session as SessionPayload & { personId: string; personName: string };
}
