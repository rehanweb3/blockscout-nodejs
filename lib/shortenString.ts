export default function shortenString(
  str: string | null | undefined,
  options?: { startLength?: number; endLength?: number },
): string {
  if (!str) return '';
  const { startLength = 6, endLength = 4 } = options || {};
  if (str.length <= startLength + endLength) return str;
  return `${str.slice(0, startLength)}…${str.slice(-endLength)}`;
}
