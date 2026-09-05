import { CrewShell } from '@/components/crew-shell';
import { requireSession } from '@/lib/session';

export default async function CrewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  return (
    <CrewShell
      shopName={session.shopName}
      personName={session.personName ?? 'Choose who you are'}
    >
      {children}
    </CrewShell>
  );
}
