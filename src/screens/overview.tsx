import { useRouter } from 'expo-router';

import { formatOffsiteDate, offsiteData } from '@/data/offsite';
import { OverviewView } from '@/presentation/overview-view';

export default function OverviewScreen() {
  const router = useRouter();
  const { event } = offsiteData;
  return (
    <OverviewView
      title={`${event.city} Offsite`}
      season={formatOffsiteDate(event.startDate, { month: 'long' }).toUpperCase()}
      destination={event.country.toUpperCase()}
      year={`’${event.startDate.slice(2, 4)}`}
      planSubtitle={`${formatOffsiteDate(event.startDate, { day: 'numeric' })}–${formatOffsiteDate(event.endDate, { day: 'numeric', month: 'short' })}`}
      citySubtitle={`${event.city} essentials`}
      onOpenPlan={() => router.navigate('/schedule')}
      onOpenCity={() => router.navigate('/oslo')}
    />
  );
}
