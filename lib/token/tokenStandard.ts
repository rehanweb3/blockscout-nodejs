export function getTokenTypeName(type: string): string {
  const names: Record<string, string> = {
    'ERC-20': 'ERC-20',
    'ERC-721': 'ERC-721 (NFT)',
    'ERC-1155': 'ERC-1155 (Multi-Token)',
    'ERC-404': 'ERC-404',
  };
  return names[type] || type;
}
