export function getPoolTitle(pool: { base_token?: { symbol?: string }; quote_token?: { symbol?: string } } | undefined): string {
  if (!pool) return 'Pool';
  const base = pool.base_token?.symbol || 'Token A';
  const quote = pool.quote_token?.symbol || 'Token B';
  return `${ base }/${ quote }`;
}

export default getPoolTitle;
