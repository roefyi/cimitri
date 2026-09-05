import { PageCard, PageHeader } from '@/components/dashboard';
import { PersonForm } from '@/components/person-form';
import { DeletePersonButton } from '@/components/delete-person-button';
import { listPeople } from '@/lib/queries';
import { requireOffice } from '@/lib/session';

export default async function PeoplePage() {
  const session = await requireOffice();
  const people = await listPeople(session.shopId);

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='People'
        description='Names for assignment and the crew who-am-I picker. Not separate logins.'
      />
      <div className='grid items-start gap-6 lg:grid-cols-3'>
        <PageCard title='Roster' className='lg:col-span-2' padded={false}>
          {people.length === 0 ? (
            <p className='px-5 py-8 text-paragraph-sm text-text-sub-600'>
              No people yet.
            </p>
          ) : (
            <ul className='divide-y divide-stroke-soft-200'>
              {people.map((person) => (
                <li
                  key={person.id}
                  className='flex items-center justify-between gap-3 px-5 py-3'
                >
                  <span className='text-label-sm text-text-strong-950'>
                    {person.name}
                  </span>
                  <DeletePersonButton personId={person.id} />
                </li>
              ))}
            </ul>
          )}
        </PageCard>
        <PageCard title='Add person'>
          <PersonForm />
        </PageCard>
      </div>
    </div>
  );
}
