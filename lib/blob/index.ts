export type BlobDataType = 'binary' | 'image' | 'json' | 'text' | 'utf8';

export function guessDataType(data: string): BlobDataType {
  if (!data) return 'binary';
  try {
    JSON.parse(data);
    return 'json';
  } catch {}
  // Check if it looks like text
  const clean = data.startsWith('0x') ? data.slice(2) : data;
  const bytes = Buffer.from(clean, 'hex');
  const str = bytes.toString('utf8');
  if (/^[\x20-\x7E\n\r\t]+$/.test(str)) return 'text';
  return 'binary';
}
