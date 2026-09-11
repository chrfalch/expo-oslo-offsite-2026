import { useRouter } from 'expo-router';
import { useState } from 'react';

import { attendees } from '@/data/attendees';
import { formatOffsiteDate, offsiteData } from '@/data/offsite';
import { OnboardingView } from '@/presentation/onboarding-view';
import { usePreferences } from '@/state/preferences';

export default function OnboardingScreen({ changing = false }: { changing?: boolean }) {
  const { attendee, store } = usePreferences();
  const [selected, setSelected] = useState<string | null>(changing ? attendee?.id ?? null : null);
  const router = useRouter();
  const people = attendees.map((person) => ({
    id: person.id,
    name: person.name,
    travelDetail: (['arrival', 'departure'] as const).map((direction) => {
      const leg = person[direction];
      const label = direction === 'arrival' ? 'Arrival' : 'Departure';
      return `${label}: ${leg ? `${formatOffsiteDate(leg.date, { day: 'numeric', month: 'short' })} · ${leg.time}` : 'Not provided'}`;
    }).join('\n'),
  }));
  return <OnboardingView people={people} selected={selected} onSelect={setSelected} changing={changing}
    eyebrow={`${offsiteData.event.city} OFFSITE · ${formatOffsiteDate(offsiteData.event.startDate, { month: 'long', year: 'numeric' })}`.toUpperCase()}
    onContinue={() => {
      if (!selected) return;
      void store.selectAttendee(selected);
      if (changing) router.dismissAll();
    }} />;
}
