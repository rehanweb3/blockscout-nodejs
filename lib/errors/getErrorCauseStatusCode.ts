export default function getErrorCauseStatusCode(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'cause' in error) {
    const cause = (error as { cause: unknown }).cause;
    if (cause && typeof cause === 'object' && 'status' in cause) {
      return Number((cause as { status: unknown }).status);
    }
  }
  return undefined;
}
