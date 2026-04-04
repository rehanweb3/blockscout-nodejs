import config from 'configs/app';

export default function buildUrl(resource: string, pathParams?: Record<string, string>, queryParams?: Record<string, string>): string {
  const base = config.apis.general.endpoint;
  let path = '';

  switch (resource) {
    case 'general:csrf':
      path = '/api/v2/csrf';
      break;
    default:
      path = `/${resource}`;
  }

  const url = new URL(`${base}${path}`);
  if (queryParams) {
    Object.entries(queryParams).forEach(([ k, v ]) => url.searchParams.set(k, v));
  }

  return url.toString();
}
