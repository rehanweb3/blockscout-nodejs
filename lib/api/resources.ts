export type ResourceError<T = unknown> = {
  status: number;
  statusText: string;
  payload?: T;
};

export type ResourceName = string;

export type PaginatedResourceName = ResourceName;

export type PaginationFilters<T = ResourceName> = Record<string, unknown>;

export type PaginationSorting<T = ResourceName> = Record<string, unknown>;

export type ResourcePayload<T = ResourceName> = Record<string, unknown>;

export const SORTING_FIELDS: Record<string, ReadonlyArray<string>> = {};

export function resourceKey(name: ResourceName, pathParams?: Record<string, unknown>): Array<unknown> {
  if (pathParams && Object.keys(pathParams).length > 0) {
    return [ name, pathParams ];
  }
  return [ name ];
}
