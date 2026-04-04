export function generatePageTitle(title: string): string {
  return `${ title } | Atherchain Explorer`;
}

export function update(_route: { pathname: string; query?: Record<string, string> }, _data: unknown): void {
  // no-op stub — metadata updates are not needed for this implementation
}

export function getPageOgTitle(title: string): string {
  return title;
}

export function getPageOgDescription(_pathname: string): string | undefined {
  return undefined;
}

export function getPageOgImage(_pathname: string): string | undefined {
  return undefined;
}
