import { useQuery } from '@tanstack/react-query';

interface Report {
  scan_report?: {
    scan_summary?: {
      score_v2?: string;
      threat_score?: string;
    };
    contractname?: string;
    scan_status?: string;
  };
}

export default function useFetchReport(address: string) {
  return useQuery<Report>({
    queryKey: [ 'solidityscan_report', address ],
    queryFn: async () => ({}),
    enabled: false,
  });
}
