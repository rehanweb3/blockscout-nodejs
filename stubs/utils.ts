export function generateListStub<T>(item: T, count = 5): Array<T> {
  return Array.from({ length: count }, () => ({ ...item as object }) as T);
}
