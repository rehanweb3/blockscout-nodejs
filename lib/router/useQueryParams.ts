import { useRouter } from 'next/router';
import { useCallback } from 'react';

export function useQueryParams() {
  const router = useRouter();

  const updateQuery = useCallback((params: Record<string, string | undefined>, replace = false) => {
    const newQuery = { ...router.query };
    Object.entries(params).forEach(([ key, value ]) => {
      if (value === undefined || value === '') {
        delete newQuery[key];
      } else {
        newQuery[key] = value;
      }
    });
    const action = replace ? router.replace : router.push;
    action({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
  }, [ router ]);

  return { query: router.query, updateQuery };
}
