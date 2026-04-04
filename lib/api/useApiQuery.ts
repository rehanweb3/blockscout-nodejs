import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { ResourceError } from './resources';
import fetchApi from './fetchApi';

export function getResourceKey(resource: string, params?: Record<string, unknown>) {
  return [ resource, params ].filter(Boolean);
}

export default function useApiQuery<T>(
  resource: string,
  options?: {
    queryParams?: Record<string, unknown>;
    pathParams?: Record<string, unknown>;
    queryOptions?: Partial<UseQueryOptions<T, ResourceError>>;
    enabled?: boolean;
  },
) {
  const { queryParams, pathParams, queryOptions, enabled } = options || {};

  return useQuery<T, ResourceError>({
    queryKey: getResourceKey(resource, { ...pathParams, ...queryParams }),
    queryFn: () => fetchApi<T>(resource, pathParams, queryParams),
    enabled: enabled !== false,
    ...queryOptions,
  });
}
