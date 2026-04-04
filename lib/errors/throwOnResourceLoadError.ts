import type { UseQueryResult } from '@tanstack/react-query';

export default function throwOnResourceLoadError(query: UseQueryResult<unknown, { status?: number }>): void {
  if (query.isError) {
    const status = (query.error as { status?: number })?.status;
    if (status === 404 || status === 422) {
      throw query.error;
    }
  }
}
