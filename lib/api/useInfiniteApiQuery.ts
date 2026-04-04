import { useInfiniteQuery } from '@tanstack/react-query';
import fetchApi from './fetchApi';

export default function useInfiniteApiQuery<T>(
  resource: string,
  options?: {
    queryParams?: Record<string, unknown>;
    pathParams?: Record<string, unknown>;
    enabled?: boolean;
  },
) {
  const { queryParams, pathParams, enabled } = options || {};

  return useInfiniteQuery<T, Error>({
    queryKey: [ resource, pathParams, queryParams ],
    queryFn: ({ pageParam }) => {
      const params = {
        ...queryParams,
        ...(pageParam as Record<string, unknown> || {}),
      };
      return fetchApi<T>(resource, pathParams, params);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: T) => {
      const page = lastPage as { next_page_params?: unknown };
      return page.next_page_params || undefined;
    },
    enabled: enabled !== false,
  });
}
