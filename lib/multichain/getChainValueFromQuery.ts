import type { ParsedUrlQuery } from 'querystring';

export default function getChainValueFromQuery(
  query: ParsedUrlQuery,
  chainIds: ReadonlyArray<string> | undefined,
): string | undefined {
  const value = query.chain;
  if (!value || !chainIds) return undefined;
  const str = Array.isArray(value) ? value[0] : value;
  return chainIds.includes(str) ? str : undefined;
}
