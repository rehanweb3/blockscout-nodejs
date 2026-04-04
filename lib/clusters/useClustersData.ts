export function useClustersData(_searchTerm: string, _viewMode: string, _page: number) {
  return {
    data: null,
    clusterDetails: null,
    isError: false,
    isLoading: false,
    isClusterDetailsLoading: false,
    hasNextPage: false,
  };
}
