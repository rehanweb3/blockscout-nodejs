import { useQueries } from '@tanstack/react-query';
import type { ResourceError } from './resources';
import fetchApi from './fetchApi';

export type ReturnType<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ResourceError | null;
};

export default function useApiQueries<T>(
  resources: Array<{ resource: string; pathParams?: Record<string, unknown>; queryParams?: Record<string, unknown> }> | undefined | null,
): Array<ReturnType<T>> {
  return useQueries({
    queries: (Array.isArray(resources) ? resources : []).map((r) => ({
      queryKey: [ r.resource, r.pathParams, r.queryParams ].filter(Boolean),
      queryFn: () => fetchApi<T>(r.resource, r.pathParams, r.queryParams),
    })),
  }) as Array<ReturnType<T>>;
}
