import { useQuery } from '@tanstack/react-query';

export default function useGraphLinks() {
  return useQuery({
    queryKey: [ 'graph_links' ],
    queryFn: async () => ({ items: [] }),
    enabled: false,
  });
}
