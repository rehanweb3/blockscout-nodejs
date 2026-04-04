import type { NextApiRequest } from 'next';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:3001';
const API_BASE = `${ BACKEND }/api/v2`;

const ROUTES: Record<string, (p?: Record<string, unknown>) => string> = {
  'stats': () => '/stats',
  'blocks': () => '/blocks',
  'block': (p) => `/blocks/${ p?.height_or_hash }`,
  'block_txs': (p) => `/blocks/${ p?.height_or_hash }/transactions`,
  'transactions': () => '/transactions',
  'transaction': (p) => `/transactions/${ p?.hash }`,
  'address': (p) => `/addresses/${ p?.hash }`,
  'token': (p) => `/tokens/${ p?.hash }`,
  'token_instance': (p) => `/tokens/${ p?.hash }/instances/${ p?.id }`,
  'tokens': () => '/tokens',
  'smart_contracts': () => '/smart-contracts',
  'search': () => '/search',
  'withdrawals': () => '/withdrawals',
  'deposits': () => '/deposits',
};

interface FetchApiOptions {
  resource: string;
  pathParams?: Record<string, unknown>;
  queryParams?: Record<string, unknown>;
  timeout?: number;
  req?: NextApiRequest;
}

export default async function fetchApi<T>({ resource, pathParams, queryParams, timeout }: FetchApiOptions): Promise<T | null> {
  try {
    const normalizedResource = resource.includes(':') ? resource.split(':').slice(1).join(':') : resource;
    const routeFn = ROUTES[normalizedResource] || ROUTES[resource];
    if (!routeFn) {
      return null;
    }

    const path = routeFn(pathParams);
    const url = new URL(`${ API_BASE }${ path }`);

    if (queryParams) {
      Object.entries(queryParams).forEach(([ key, value ]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const controller = new AbortController();
    const timer = timeout ? setTimeout(() => controller.abort(), timeout) : undefined;

    const response = await fetch(url.toString(), {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    if (timer) clearTimeout(timer);

    if (!response.ok) {
      return null;
    }

    return response.json() as Promise<T>;
  } catch {
    return null;
  }
}
