import { useQuery } from '@tanstack/react-query';

export default function useAddressMetadataInfoQuery(addresses: Array<string>, enabled = true) {
  return useQuery({
    queryKey: [ 'address_metadata', addresses ],
    queryFn: async () => ({}),
    enabled: enabled && addresses.length > 0,
  });
}
