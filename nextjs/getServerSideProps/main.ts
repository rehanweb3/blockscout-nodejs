import type { GetServerSidePropsContext } from 'next';

export async function base(context: GetServerSidePropsContext) {
  return {
    props: {
      query: context.query,
      apiData: null,
      uuid: Math.random().toString(36).slice(2),
    },
  };
}

export const tx = base;
export const block = base;
export const address = base;
export const token = base;
