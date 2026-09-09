import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, useSyncExternalStore, type PropsWithChildren } from 'react';

import { getAttendee } from '@/data/attendees';
import { createPreferencesStore, emptyPersonal } from '@/state/preferences-store';

const PreferencesContext = createContext<ReturnType<typeof createPreferencesStore> | null>(null);

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [store] = useState(() => createPreferencesStore(AsyncStorage));
  useEffect(() => { void store.hydrate(); }, [store]);
  return <PreferencesContext value={store}>{children}</PreferencesContext>;
}

export function usePreferences() {
  const store = use(PreferencesContext);
  if (!store) throw new Error('PreferencesProvider is missing');
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const attendee = getAttendee(snapshot.value.attendeeId);
  return { ...snapshot, attendee, personal: attendee ? snapshot.value.people[attendee.id] ?? emptyPersonal : emptyPersonal, store };
}
