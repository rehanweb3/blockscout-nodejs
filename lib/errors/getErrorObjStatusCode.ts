export default function getErrorObjStatusCode(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'status' in error) {
    return Number((error as { status: unknown }).status);
  }
  return undefined;
}
