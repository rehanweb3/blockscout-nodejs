export default function getFilterValuesFromQuery<T extends string>(
  query: Record<string, string | string[] | undefined>,
  filterName: string,
  values: ReadonlyArray<T>,
): Array<T> {
  const raw = query[filterName];
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : raw.split(',');
  return list.filter((v): v is T => (values as ReadonlyArray<string>).includes(v));
}
