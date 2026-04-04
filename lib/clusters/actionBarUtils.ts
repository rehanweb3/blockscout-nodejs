export function getSearchPlaceholder(viewMode: string): string {
  return viewMode === 'leaderboard' ? 'Search by name or address' : 'Search by name, address, or domain';
}

export function shouldShowActionBar(isLoading: boolean, hasData: boolean, searchTerm?: string): boolean {
  return !isLoading || hasData || Boolean(searchTerm);
}
