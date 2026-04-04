export function getResourceKey(resource: string, params?: Record<string, unknown>): Array<unknown> {
  return [ resource, params ].filter(Boolean);
}
