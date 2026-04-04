import type { ClustersByAddressResponse } from 'types/api/clusters';

export function filterOwnedClusters(data: ClustersByAddressResponse | undefined) {
  return data?.items?.filter((c: { role: string }) => c.role === 'owner') ?? [];
}

export function getTotalRecordsDisplay(total: number) {
  return total > 999 ? '999+' : String(total);
}

export function getClusterLabel(cluster: { name?: string; id?: string }) {
  return cluster.name || cluster.id || 'Unknown';
}

export function getClustersToShow(clusters: Array<unknown>, max: number) {
  return clusters.slice(0, max);
}

export function getGridRows(clusters: Array<unknown>, cols: number) {
  return Math.ceil(clusters.length / cols);
}

export function hasMoreClusters(clusters: Array<unknown>, max: number) {
  return clusters.length > max;
}
