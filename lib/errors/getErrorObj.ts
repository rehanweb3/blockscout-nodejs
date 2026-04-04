export default function getErrorObj(error: unknown): Record<string, unknown> | null {
  if (error && typeof error === 'object') return error as Record<string, unknown>;
  return null;
}
