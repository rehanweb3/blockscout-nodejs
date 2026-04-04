const DEFAULT_PAGE_SIZE = 50;

export default function getItemIndex<T>(itemsOrOffset: Array<T> | number, itemOrPage: T | number): number {
  if (Array.isArray(itemsOrOffset)) {
    return itemsOrOffset.indexOf(itemOrPage as T);
  }
  const offset = itemsOrOffset as number;
  const page = (itemOrPage as number) || 1;
  return offset + (page - 1) * DEFAULT_PAGE_SIZE;
}
