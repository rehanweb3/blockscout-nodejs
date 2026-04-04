import { Box, Flex, Skeleton } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import React from 'react';

import config from 'configs/app';
import useIsMobile from 'lib/hooks/useIsMobile';
import { HomeRpcDataContextProvider } from 'ui/home/fallbacks/rpcDataContext';
import HeroBanner from 'ui/home/HeroBanner';

const Highlights = dynamic(() => import('ui/home/Highlights'), { ssr: false });
const ChainIndicators = dynamic(() => import('ui/home/indicators/ChainIndicators'), { ssr: false });
const LatestArbitrumL2Batches = dynamic(() => import('ui/home/latestBatches/LatestArbitrumL2Batches'), { ssr: false });
const LatestZkEvmL2Batches = dynamic(() => import('ui/home/latestBatches/LatestZkEvmL2Batches'), { ssr: false });
const LatestBlocks = dynamic(() => import('ui/home/LatestBlocks'), { ssr: false });
const Stats = dynamic(() => import('ui/home/Stats'), {
  ssr: false,
  loading: () => <Skeleton height="80px" borderRadius="md" flex={ 1 }/>,
});
const Transactions = dynamic(() => import('ui/home/Transactions'), {
  ssr: false,
  loading: () => <Skeleton height="300px" borderRadius="md" flex={ 1 }/>,
});
const AdBanner = dynamic(() => import('ui/shared/ad/AdBanner'), { ssr: false });

const rollupFeature = config.features.rollup;

const Home = () => {
  const isMobile = useIsMobile();

  const leftWidget = (() => {
    if (rollupFeature.isEnabled && !rollupFeature.homepage.showLatestBlocks) {
      switch (rollupFeature.type) {
        case 'zkEvm':
          return <LatestZkEvmL2Batches/>;
        case 'arbitrum':
          return <LatestArbitrumL2Batches/>;
      }
    }

    return <LatestBlocks/>;
  })();

  return (
    <HomeRpcDataContextProvider>
      <Box as="main">
        <HeroBanner/>
        <Flex flexDir={{ base: 'column', lg: 'row' }} columnGap={ 2 } rowGap={ 1 } mt={ 3 } _empty={{ mt: 0 }}>
          <Stats/>
          <ChainIndicators/>
        </Flex>
        { !isMobile && config.UI.homepage.highlights && <Highlights mt={ 3 }/> }
        { isMobile && <AdBanner mt={ 6 } mx="auto" justifyContent="center" format="mobile"/> }
        <Flex mt={ 8 } direction={{ base: 'column', lg: 'row' }} columnGap={ 12 } rowGap={ 6 }>
          { leftWidget }
          <Box flexGrow={ 1 }>
            <Transactions/>
          </Box>
        </Flex>
      </Box>
    </HomeRpcDataContextProvider>
  );
};

export default Home;
