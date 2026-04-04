import { useQuery } from '@tanstack/react-query';

export default function useIsSafeAddress(_address: string | undefined) {
  return useQuery({
    queryKey: [ 'is_safe_address', _address ],
    queryFn: async () => false,
    enabled: false,
  });
}
