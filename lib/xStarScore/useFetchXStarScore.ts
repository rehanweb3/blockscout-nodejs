import { useQuery } from '@tanstack/react-query';

export default function useFetchXStarScore(_address: string | undefined) {
  return useQuery({
    queryKey: [ 'xstar_score', _address ],
    queryFn: async () => null,
    enabled: false,
  });
}
