import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

import { route } from 'nextjs-routes';

import config from 'configs/app';
import useApiQuery from 'lib/api/useApiQuery';
import { AddressHighlightProvider } from 'lib/contexts/addressHighlight';
import useIsMobile from 'lib/hooks/useIsMobile';
import { TX } from 'stubs/tx';
import { Link } from 'toolkit/chakra/link';
import SocketNewItemsNotice from 'ui/shared/SocketNewItemsNotice';

import LatestTxsDegraded from './fallbacks/LatestTxsDegraded';
import LatestTxsItem from './LatestTxsItem';
import LatestTxsItemMobile from './LatestTxsItemMobile';

const zetachainFeature = config.features.zetachain;

const LatestTxs = () => {
  const isMobile = useIsMobile();
  const txsCount = isMobile ? 2 : 5;
  const { data, isPlaceholderData, isError } = useApiQuery('general:homepage_txs', {
    queryOptions: {
      placeholderData: Array(txsCount).fill(TX),
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
    },
  });

  const seenHashesRef = React.useRef<Set<string> | null>(null);
  const [ num, setNum ] = React.useState(0);

  React.useEffect(() => {
    if (!data || isPlaceholderData) return;
    const hashes = data.map((tx) => tx.hash);
    if (seenHashesRef.current === null) {
      seenHashesRef.current = new Set(hashes);
      return;
    }
    const newCount = hashes.filter((h) => !seenHashesRef.current!.has(h)).length;
    if (newCount > 0) {
      setNum((prev) => prev + newCount);
      hashes.forEach((h) => seenHashesRef.current!.add(h));
    }
  }, [ data, isPlaceholderData ]);

  if (isError) {
    return <LatestTxsDegraded maxNum={ txsCount }/>;
  }

  if (data) {
    const txsUrl = route({ pathname: `/txs`, query: zetachainFeature.isEnabled ? { tab: 'evm' } : undefined });
    const handleLinkClick = React.useCallback(() => {
      seenHashesRef.current = null;
      setNum(0);
    }, []);
    return (
      <>
        <SocketNewItemsNotice
          borderBottomRadius={ 0 }
          url={ txsUrl }
          num={ num }
          showErrorAlert={ false }
          isLoading={ isPlaceholderData }
          onLinkClick={ handleLinkClick }
        />
        <Box mb={ 3 } display={{ base: 'block', lg: 'none' }} textStyle="sm">
          { data.slice(0, txsCount).map(((tx, index) => (
            <LatestTxsItemMobile
              key={ tx.hash + (isPlaceholderData ? index : '') }
              tx={ tx }
              isLoading={ isPlaceholderData }
            />
          ))) }
        </Box>
        <AddressHighlightProvider>
          <Box mb={ 3 } display={{ base: 'none', lg: 'block' }} textStyle="sm">
            { data.slice(0, txsCount).map(((tx, index) => (
              <LatestTxsItem
                key={ tx.hash + (isPlaceholderData ? index : '') }
                tx={ tx }
                isLoading={ isPlaceholderData }
              />
            ))) }
          </Box>
        </AddressHighlightProvider>
        <Flex justifyContent="center">
          <Link textStyle="sm" loading={ isPlaceholderData } href={ txsUrl }>View all transactions</Link>
        </Flex>
      </>
    );
  }

  return <Text>No latest transactions found.</Text>;
};

export default LatestTxs;
