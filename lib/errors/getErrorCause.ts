export default function getErrorCause(error: unknown): unknown {
  if (error && typeof error === 'object' && 'cause' in error) {
    return (error as { cause: unknown }).cause;
  }
  return undefined;
}
