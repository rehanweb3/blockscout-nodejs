export function useClusterPagination(hasNextPage: boolean, isLoading: boolean) {
  return {
    pagination: {
      hasNextPage,
      isLoading,
      onNextPageClick: () => {},
      onPrevPageClick: () => {},
      page: 1,
      canGoBackwards: { current: false },
    },
  };
}
