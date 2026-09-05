'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/datepicker';

export function ScheduleCalendar({
  selectedIso,
  jobDates,
  hrefForDate,
}: {
  selectedIso: string;
  jobDates: string[];
  hrefForDate: string;
}) {
  const router = useRouter();
  const selected = parseISO(selectedIso);
  const [month, setMonth] = useState(selected);
  const marked = jobDates.map((iso) => parseISO(iso));

  useEffect(() => {
    setMonth(parseISO(selectedIso));
  }, [selectedIso]);

  return (
    <Calendar
      mode='single'
      month={month}
      onMonthChange={setMonth}
      selected={selected}
      onSelect={(day) => {
        if (!day) return;
        router.push(hrefForDate.replace('DATE', format(day, 'yyyy-MM-dd')));
      }}
      modifiers={{ hasJobs: marked }}
      modifiersClassNames={{
        hasJobs:
          'relative after:absolute after:bottom-1 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:rounded-full after:bg-primary-base',
      }}
    />
  );
}
