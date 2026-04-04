import type { ColorMode } from 'toolkit/chakra/color-mode';

import type { ColorThemeId } from 'types/settings';

export type ColorTheme = {
  name: string;
  id: ColorThemeId;
  hex: string;
  colorMode: ColorMode;
  label: string;
  sampleBg: string;
};

export const COLOR_THEMES: ReadonlyArray<ColorTheme> = [
  {
    name: 'Light',
    id: 'light',
    hex: '#FFFFFF',
    colorMode: 'light',
    label: 'Default light',
    sampleBg: 'linear-gradient(135deg, #FFFFFF 0%, #EDF2F7 100%)',
  },
  {
    name: 'Dark',
    id: 'dark',
    hex: '#1A1B1F',
    colorMode: 'dark',
    label: 'Default dark',
    sampleBg: 'linear-gradient(135deg, #1A1B1F 0%, #2D2E35 100%)',
  },
  {
    name: 'Dim',
    id: 'dim',
    hex: '#2D2E35',
    colorMode: 'dark',
    label: 'Dim',
    sampleBg: 'linear-gradient(135deg, #2D2E35 0%, #44454F 100%)',
  },
  {
    name: 'Midnight',
    id: 'midnight',
    hex: '#0D0E12',
    colorMode: 'dark',
    label: 'Midnight',
    sampleBg: 'linear-gradient(135deg, #0D0E12 0%, #1A1B1F 100%)',
  },
];

export function getDefaultColorTheme(colorMode?: string): ColorThemeId {
  if (colorMode === 'dark') {
    return 'dark';
  }
  return 'light';
}

export function getThemeHexWithOverrides(id: string): string {
  return COLOR_THEMES.find((t) => t.id === id)?.hex || '#FFFFFF';
}
