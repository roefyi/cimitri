import { OfficeShell } from '@/components/office-shell';
import { requireOffice } from '@/lib/session';

export default async function OfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireOffice();
  return <OfficeShell shopName={session.shopName}>{children}</OfficeShell>;
}
