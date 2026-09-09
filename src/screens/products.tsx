import { useState } from 'react';
import { Linking, Platform } from 'react-native';

import { offsiteData } from '@/data/offsite';
import { getGuideImage } from '@/media/guide-images';
import { ContentPageView } from '@/presentation/content-page-view';
import { useScreenObserve } from '@/screens/use-screen-observe';

export default function ProductsScreen() {
  useScreenObserve();
  const [failedApp, setFailedApp] = useState<string>();

  async function openApp(app: typeof offsiteData.expoCustomerApps[number]) {
    setFailedApp(undefined);
    const android = Platform.OS === 'android' || (Platform.OS === 'web' && typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent));
    try { await Linking.openURL(android ? app.googlePlayUrl : app.appStoreUrl); }
    catch { setFailedApp(app.id); }
  }

  return <ContentPageView sections={[{
    id: 'expo-products',
    rows: offsiteData.expoCustomerApps.map((app) => ({
      id: `product-${app.id}`, title: app.name, icon: app.emoji, image: getGuideImage(app.image, app.name),
      detail: failedApp === app.id ? `${app.description}\nCouldn’t open the store. Check your connection and tap again.` : app.description,
      onPress: () => { void openApp(app); },
    })),
  }]} />;
}
