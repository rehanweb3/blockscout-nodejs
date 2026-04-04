import type { ParsedUrlQuery } from 'querystring';

export default function getValuesArrayFromQuery(value: ParsedUrlQuery[string]): Array<string> {
  if (!value) return [];
  const str = Array.isArray(value) ? value[0] : value;
  return str ? str.split(',').filter(Boolean) : [];
}
