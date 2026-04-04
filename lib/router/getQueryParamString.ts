export default function getQueryParamString(value: string | Array<string> | undefined): string {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}
