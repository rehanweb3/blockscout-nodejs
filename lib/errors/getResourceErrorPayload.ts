export default function getResourceErrorPayload(error: unknown): Record<string, unknown> | null {
  if (error && typeof error === 'object' && 'payload' in error) {
    return (error as { payload: Record<string, unknown> }).payload;
  }
  return null;
}
