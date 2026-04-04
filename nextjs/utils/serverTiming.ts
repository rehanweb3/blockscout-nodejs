import type { ServerResponse } from 'http';

export function appendValue(res: ServerResponse | null | undefined, name: string, value: number): void {
  if (!res) return;
  try {
    const header = res.getHeader('Server-Timing');
    const existing = header ? String(header) + ', ' : '';
    res.setHeader('Server-Timing', `${existing}${name};dur=${value}`);
  } catch {}
}

export function startMeasure(_label: string): () => void {
  const start = Date.now();
  return () => Date.now() - start;
}

export function setServerTiming(res: ServerResponse | null | undefined, entries: Record<string, number>): void {
  if (!res) return;
  const headerValue = Object.entries(entries)
    .map(([ name, dur ]) => `${name};dur=${dur}`)
    .join(', ');
  try {
    res.setHeader('Server-Timing', headerValue);
  } catch {}
}
