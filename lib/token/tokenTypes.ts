export const TOKEN_TYPES = [ 'ERC-20', 'ERC-721', 'ERC-1155', 'ERC-404' ] as const;

export const NFT_TOKEN_TYPE_IDS: ReadonlyArray<string> = [ 'ERC-721', 'ERC-1155', 'ERC-404' ];

export function hasTokenTransferValue(tokenType: string | undefined): boolean {
  return tokenType === 'ERC-20';
}

export function isFungibleTokenType(tokenType: string | undefined): boolean {
  return tokenType === 'ERC-20';
}

export function hasTokenIds(tokenType: string | undefined): boolean {
  return tokenType === 'ERC-721' || tokenType === 'ERC-1155';
}

export type TokenType = typeof TOKEN_TYPES[number];

export const CONFIDENTIAL_TOKEN_TYPES: ReadonlyArray<string> = [];

export function isConfidentialTokenType(type: string): boolean {
  return CONFIDENTIAL_TOKEN_TYPES.includes(type);
}

export function getTokenTypeName(type: TokenType): string {
  return type;
}

export function getTokenTypes(
  _isMultiChain?: boolean,
  _chainConfig?: unknown,
): Record<string, string> {
  return Object.fromEntries(TOKEN_TYPES.map((t) => [ t, t ]));
}
