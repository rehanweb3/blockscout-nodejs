import { useBreakpointValue } from '@chakra-ui/react';

export default function useIsMobile(): boolean {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  return isMobile ?? false;
}
