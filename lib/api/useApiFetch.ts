import React from 'react';
import fetchApi from './fetchApi';

export interface ApiFetchOptions {
  pathParams?: Record<string, unknown>;
  queryParams?: Record<string, unknown>;
  fetchParams?: RequestInit;
}

export default function useApiFetch() {
  return React.useCallback(
    <T>(resource: string, options?: ApiFetchOptions | Record<string, unknown>): Promise<T> => {
      if (options && ('pathParams' in options || 'queryParams' in options || 'fetchParams' in options)) {
        const { pathParams, queryParams, fetchParams } = options as ApiFetchOptions;
        return fetchApi<T>(resource, pathParams, queryParams, fetchParams);
      }
      return fetchApi<T>(resource, options as Record<string, unknown> | undefined);
    },
    [],
  );
}
