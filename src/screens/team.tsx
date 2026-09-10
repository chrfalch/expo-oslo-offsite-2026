import { attendees } from '@/data/attendees';
import { formatOffsiteDate } from '@/data/offsite';
import { ContentPageView } from '@/presentation/content-page-view';
import { useOffsiteNavigation } from '@/screens/navigation';
import { useScreenObserve } from '@/screens/use-screen-observe';

export function TeamScreen() {
  useScreenObserve();
  const { router } = useOffsiteNavigation();
  const team = [...attendees].sort((left, right) => {
    const leftArrival = left.arrival ? `${left.arrival.date} ${left.arrival.time}` : '9999';
    const rightArrival = right.arrival ? `${right.arrival.date} ${right.arrival.time}` : '9999';
    return leftArrival.localeCompare(rightArrival) || left.name.localeCompare(right.name, 'nb');
  });
  return <ContentPageView intro="Team arrivals are shown in Oslo local time." sections={[{
    id: 'team-arrivals', title: 'Arrivals', rows: team.map((member) => ({
      id: `team-${member.id}`,
      title: member.name,
      detail: member.arrival
        ? `${formatOffsiteDate(member.arrival.date, { day: 'numeric', month: 'short' })} · ${member.arrival.time}`
        : 'Arrival not provided',
      onPress: () => router.push({ pathname: '/travel', params: { mode: 'all' } }),
    })),
  }]} />;
}
