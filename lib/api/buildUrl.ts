import config from 'configs/app';

export default function buildUrl(resource: string, pathParams?: Record<string, unknown>, queryParams?: Record<string, unknown>): string {
  const base = config.api.endpoint || '';
  let path = `/${resource}`;

  if (pathParams) {
    Object.entries(pathParams).forEach(([ key, value ]) => {
      path = path.replace(`:${key}`, String(value));
    });
  }

  const url = new URL(`${base}${path}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

  if (queryParams) {
    Object.entries(queryParams).forEach(([ key, value ]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}
