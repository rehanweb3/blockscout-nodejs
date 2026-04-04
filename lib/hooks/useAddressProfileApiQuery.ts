import { useQuery } from '@tanstack/react-query';

export default function useAddressProfileApiQuery(_address: string | undefined, _enabled = true) {
  return useQuery({
    queryKey: [ 'address_profile', _address ],
    queryFn: async () => null,
    enabled: false,
  });
}
