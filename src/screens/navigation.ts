import { useRouter } from 'expo-router';

export function useOffsiteNavigation() {
  const router = useRouter();
  return {
    router,
    location: (key: string) => router.push({ pathname: '/location/[key]', params: { key } }),
    place: (id: string) => router.push({ pathname: '/place/[id]', params: { id } }),
    activity: (id: string) => router.push({ pathname: '/activity/[id]', params: { id } }),
  };
}
