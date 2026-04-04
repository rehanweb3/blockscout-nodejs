interface NetworkUtilizationParams {
  load: string;
  color: string;
  label: string;
}

export default function getNetworkUtilizationParams(percentage: number): NetworkUtilizationParams {
  if (percentage >= 80) {
    return { load: 'high', color: 'red.400', label: 'Network utilization' };
  }
  if (percentage >= 50) {
    return { load: 'medium', color: 'orange.400', label: 'Network utilization' };
  }
  return { load: 'low', color: 'green.400', label: 'Network utilization' };
}
