import type { GetServerSidePropsContext } from 'next';

export type Props = {
  query: GetServerSidePropsContext['query'];
  apiData: unknown;
  uuid: string;
};

export type ServerSidePropsCommon = Props;
