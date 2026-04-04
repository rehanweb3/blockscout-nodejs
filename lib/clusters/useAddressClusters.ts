import { useQuery } from '@tanstack/react-query';

export function useAddressClusters(address: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [ 'address_clusters', address ],
    queryFn: async () => ({ items: [], next_page_params: null }),
    enabled: enabled && Boolean(address),
  });
}
