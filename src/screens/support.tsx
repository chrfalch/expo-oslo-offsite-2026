import { offsiteData } from '@/data/offsite';
import { getGuideImage } from '@/media/guide-images';
import { ContentPageView } from '@/presentation/content-page-view';
import { useOffsiteNavigation } from '@/screens/navigation';

export default function SupportScreen() {
  const { location } = useOffsiteNavigation();
  const { event, support } = offsiteData;

  return <ContentPageView intro="A little lost? A little stuck? Call in the local." sections={[
    { id: 'support-contact', cards: [{
      id: 'christian-support', title: event.organizer, eyebrow: 'YOUR ONE-PERSON HELP DESK',
      description: 'Offsite questions, Oslo mysteries, or just need a hand? Christian is your local human. No ticket number required.',
      details: [support.phone, 'The same number works for calls and WhatsApp.'],
      links: [
        { label: `Call ${support.phone}`, url: support.phoneUrl,
          failureMessage: `This device couldn’t start a call. Dial ${support.phone} on your phone, or try WhatsApp below.` },
        { label: 'Chat on WhatsApp', url: support.whatsappUrl,
          failureMessage: `Couldn’t open WhatsApp. Try again when connected, or add ${support.phone} in WhatsApp.` },
      ],
    }] },
    { id: 'support-home', title: 'Christian’s home', cards: [{
      id: 'christian-home', title: support.home.name, eyebrow: 'LOCAL HOST',
      description: support.home.address, details: [support.home.notes],
      image: getGuideImage(support.home.image, support.home.name),
      actions: [{ label: 'Find Christian’s home', primary: true, testID: 'support-home-map', onPress: () => location('home:christian') }],
    }] },
  ]} />;
}
