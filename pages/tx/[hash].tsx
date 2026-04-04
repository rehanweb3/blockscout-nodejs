import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import { Flex, Spinner } from '@chakra-ui/react';

import type { Props } from 'nextjs/getServerSideProps/handlers';
import PageNextJs from 'nextjs/PageNextJs';

const Transaction = dynamic(() => {
  return import('ui/pages/Transaction');
}, {
  ssr: false,
  loading: () => (
    <Flex w="full" justifyContent="center" alignItems="center" minH="400px">
      <Spinner size="xl" color="blue.400"/>
    </Flex>
  ),
});

const Page: NextPage<Props> = (props: Props) => {
  return (
    <PageNextJs pathname="/tx/[hash]" query={ props.query }>
      <Transaction/>
    </PageNextJs>
  );
};

export default Page;

export { tx as getServerSideProps } from 'nextjs/getServerSideProps/main';
