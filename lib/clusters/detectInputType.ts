export type InputType = 'address' | 'cluster_name' | 'domain' | 'unknown';

export function detectInputType(input: string): InputType {
  if (!input) return 'unknown';
  if (input.startsWith('0x') && input.length === 42) return 'address';
  if (input.includes('.')) return 'domain';
  return 'cluster_name';
}
