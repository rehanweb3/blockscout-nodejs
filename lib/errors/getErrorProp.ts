export default function getErrorProp<T>(error: unknown, prop: string): T | undefined {
  if (error && typeof error === 'object' && prop in error) {
    return (error as Record<string, unknown>)[prop] as T;
  }
  return undefined;
}
