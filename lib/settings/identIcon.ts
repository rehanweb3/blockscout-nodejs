export const IDENTICONS = [
  { name: 'Jazzicon', id: 'jazzicon' },
  { name: 'Gradient Avatar', id: 'gradient_avatar' },
  { name: 'Blockie', id: 'blockie' },
] as const;

export type IdenticonType = typeof IDENTICONS[number]['id'];
