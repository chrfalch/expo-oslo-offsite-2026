import { useObserve } from 'expo-observe';
import { useEffect } from 'react';

/** Screens mount after preferences hydrate and render their bundled guide data synchronously. */
export function useScreenObserve() {
  const { markInteractive } = useObserve();

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);
}
