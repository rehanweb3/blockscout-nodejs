import { useInfiniteQuery } from '@tanstack/react-query';
import type { UseInfiniteQueryOptions, InfiniteData } from '@tanstack/react-query';
import type { ResourceError } from './resources';
import fetchApi from './fetchApi';

export interface Params<Resource extends string> {
  resourceName: Resource;
  pathParams?: Record<string, unknown>;
  queryParams?: Record<string, unknown>;
  queryOptions?: Partial<UseInfiniteQueryOptions<unknown, ResourceError, InfiniteData<unknown>, unknown, Array<unknown>, Record<string, unknown> | null>>;
}

export type ReturnType<T = unknown> = ReturnType<typeof useInfiniteQuery<T>>;

export default function useApiInfiniteQuery<T>({
  resourceName,
  pathParams,
  queryParams,
  queryOptions,
}: Params<string>) {
  return useInfiniteQuery<T, ResourceError, InfiniteData<T>, Array<unknown>, Record<string, unknown> | null>({
    queryKey: [ resourceName, { ...pathParams, ...queryParams } ],
    queryFn: ({ pageParam }) => fetchApi<T>(resourceName, pathParams, { ...queryParams, ...(pageParam || {}) }),
    initialPageParam: null,
    getNextPageParam: (lastPage: unknown) => {
      const page = lastPage as { next_page_params?: Record<string, unknown> | null };
      return page?.next_page_params ?? null;
    },
    ...queryOptions,
  } as Parameters<typeof useInfiniteQuery<T, ResourceError, InfiniteData<T>, Array<unknown>, Record<string, unknown> | null>>[0]);
}
