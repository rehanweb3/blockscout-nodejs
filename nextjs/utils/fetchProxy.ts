import type { NextApiRequest } from 'next';

export default function fetchFactory(_req?: NextApiRequest) {
  return async (url: string, options?: RequestInit) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options as RequestInit & { headers?: Record<string, string> })?.headers,
      },
    });
  };
}
