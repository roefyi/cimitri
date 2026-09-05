import * as Button from '@/components/ui/button';
import { PageCard, PageHeader } from '@/components/dashboard';
import { setPersonAction } from '@/app/actions/auth';
import { listPeople } from '@/lib/queries';
import { requireSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function WhoAmIPage() {
  const session = await requireSession();
  if (session.mode !== 'crew') redirect('/mode');
  const people = await listPeople(session.shopId);
  const lastName = session.personName;

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Who are you?'
        description='Pick your name. Office assigned jobs to these people. This is not a password.'
      />
      {people.length === 0 ? (
        <PageCard>
          <p className='text-paragraph-sm text-text-sub-600'>
            Office has not added people yet.
          </p>
        </PageCard>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {people.map((person) => {
            const lastUsed = person.name === lastName;
            return (
              <PageCard key={person.id} title={person.name}>
                <p className='text-paragraph-sm text-text-sub-600'>
                  {lastUsed ? 'Last used on this device.' : 'Jobs assigned to this name.'}
                </p>
                <form action={setPersonAction.bind(null, person.id)} className='mt-4'>
                  <Button.Root
                    type='submit'
                    className='w-full'
                    variant={lastUsed ? 'primary' : 'neutral'}
                    mode={lastUsed ? 'filled' : 'stroke'}
                  >
                    Continue as {person.name}
                  </Button.Root>
                </form>
              </PageCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
