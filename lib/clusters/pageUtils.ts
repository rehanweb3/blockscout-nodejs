export type ViewMode = 'directory' | 'list';

export function getInitialViewMode(query: Record<string, string | string[] | undefined>): ViewMode {
  return (query.view as ViewMode) || 'directory';
}

export function buildPageUrl(pathname: string, query: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([ k, v ]) => {
    if (v !== undefined && v !== null) params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${ pathname }?${ qs }` : pathname;
}
