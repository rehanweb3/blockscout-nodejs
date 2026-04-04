import type { NextRouter } from 'next/router';

export default function removeQueryParam(router: NextRouter, paramName: string) {
  const newQuery = { ...router.query };
  delete newQuery[paramName];
  router.push({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
}
