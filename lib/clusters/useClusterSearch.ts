import { useRouter } from 'next/router';
import { useState } from 'react';
import getQueryParamString from 'lib/router/getQueryParamString';

export function useClusterSearch() {
  const router = useRouter();
  const initialSearch = getQueryParamString(router.query.q) || '';
  const [ searchTerm, setSearchTerm ] = useState(initialSearch);
  return { searchTerm, debouncedSearchTerm: searchTerm, setSearchTerm };
}
