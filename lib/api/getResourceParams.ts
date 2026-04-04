import type { PaginatedResourceName } from './resources';

type ResourceDescriptor = {
  filterFields: ReadonlyArray<string>;
  path: string;
};

export default function getResourceParams(
  resourceName: PaginatedResourceName,
  selectedChain?: string,
): { resource: ResourceDescriptor } {
  return {
    resource: {
      path: `/api/v2/${ resourceName }`,
      filterFields: [],
    },
  };
}
