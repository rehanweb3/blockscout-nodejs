export const PAGE_TYPE_DICT: Record<string, string> = {
  '/': 'main_page',
  '/txs': 'transactions',
  '/blocks': 'blocks',
  '/tx/[hash]': 'transaction',
  '/block/[height_or_hash]': 'block',
  '/address/[hash]': 'address',
  '/tokens': 'tokens',
  '/token/[hash]': 'token',
  '/accounts': 'top_accounts',
  '/stats': 'stats',
};

export default function getPageType(pathname: string): string {
  return PAGE_TYPE_DICT[pathname] ?? (pathname.replace(/\//g, '_').slice(1) || 'home');
}
