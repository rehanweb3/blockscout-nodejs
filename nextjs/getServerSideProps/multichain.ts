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
