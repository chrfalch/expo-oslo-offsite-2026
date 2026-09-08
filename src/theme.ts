import { useColorScheme, useWindowDimensions } from 'react-native';

export const palette = {
  light: {
    background: '#F7F8FA',
    surface: '#FFFFFF',
    text: '#17191C',
    secondaryText: '#666B73',
    accent: '#6D3FB3',
    accentSoft: '#EDE5F8',
    border: '#E0E3E8',
    hero: '#DDD0F3',
    heroText: '#38214E',
    autumn: '#ECBB6D',
    autumnText: '#3B2610',
  },
  dark: {
    background: '#0C0D0E',
    surface: '#1C1E21',
    text: '#F5F5F6',
    secondaryText: '#A5A9B0',
    accent: '#C7A5FF',
    accentSoft: '#322741',
    border: '#303338',
    hero: '#493566',
    heroText: '#F2E8FF',
    autumn: '#C28A3B',
    autumnText: '#3B2610',
  },
} as const;

export const layout = {
  pagePadding: 20,
  sectionGap: 16,
  cardRadius: 24,
  heroRadius: 26,
  maxWidth: 600,
} as const;

export function useOffsiteTheme() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { scheme, colors: palette[scheme] } as const;
}

export function useContentWidth() {
  const { width } = useWindowDimensions();
  return Math.min(layout.maxWidth, width - layout.pagePadding * 2);
}
