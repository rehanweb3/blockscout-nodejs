export default function isMetaKey(event: KeyboardEvent | MouseEvent): boolean {
  return event.metaKey || event.ctrlKey;
}
