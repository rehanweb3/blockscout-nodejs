import type { ParsedUrlQuery } from 'querystring';

export default function getFilterValueFromQuery<T extends string>(
  filters: ReadonlyArray<T> | undefined,
  value: ParsedUrlQuery[string],
): T | undefined {
  if (!value || !filters) return undefined;
  const str = Array.isArray(value) ? value[0] : value;
  return filters.includes(str as T) ? (str as T) : undefined;
}
