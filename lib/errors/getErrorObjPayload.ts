export default function getErrorObjPayload<T>(error: unknown): T | null {
  if (error && typeof error === 'object' && 'payload' in error) {
    return (error as { payload: T }).payload;
  }
  return null;
}
