import { Box, Flex } from '@chakra-ui/react';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { sumBy } from 'es-toolkit';
import { useRouter } from 'next/router';
import React from 'react';

import type { Address } from 'types/api/address';

import { route } from 'nextjs/routes';

import { getResourceKey } from 'lib/api/useApiQuery';
import useIsMobile from 'lib/hooks/useIsMobile';
import * as mixpanel from 'lib/mixpanel/index';
import getQueryParamString from 'lib/router/getQueryParamString';
import WalletIcon from 'icons/wallet.svg';
import { IconButton } from 'toolkit/chakra/icon-button';
import { Skeleton } from 'toolkit/chakra/skeleton';
import { Tooltip } from 'toolkit/chakra/tooltip';

import useFetchTokens from '../utils/useFetchTokens';
import TokenSelectDesktop from './TokenSelectDesktop';
import TokenSelectMobile from './TokenSelectMobile';

const TokenSelect = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const addressHash = getQueryParamString(router.query.hash);
  const addressResourceKey = getResourceKey('general:address', { hash: addressHash });

  const addressQueryData = queryClient.getQueryData<Address>(addressResourceKey);

  const { data, isError, isPending } = useFetchTokens({ hash: addressHash, enabled: addressQueryData ? addressQueryData.has_tokens : Boolean(addressHash) });
  const tokensResourceKey = getResourceKey('general:address_tokens', {
    hash: addressHash,
    type: 'ERC-20',
  });
  const tokensIsFetching = useIsFetching({ queryKey: tokensResourceKey });

  const handleIconButtonClick = React.useCallback(() => {
    mixpanel.logEvent(mixpanel.EventTypes.PAGE_WIDGET, { Type: 'Tokens show all (icon)' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.push(
      route({ pathname: '/address/[hash]', query: { hash: addressHash, tab: 'tokens' } }),
      undefined,
      { scroll: false },
    );
  }, [ router, addressHash ]);

  if (isPending) {
    return (
      <Flex columnGap={ 3 }>
        <Skeleton loading h={ 8 } w="150px" borderRadius="base"/>
        <Skeleton loading h={ 8 } w={ 9 } borderRadius="base"/>
      </Flex>
    );
  }

  const hasTokens = sumBy(Object.values(data), ({ items }) => items.length) > 0;
  if (isError || !hasTokens) {
    return <Box py="6px">0</Box>;
  }

  return (
    <Flex columnGap={ 3 } mt={{ base: 1, lg: 0 }}>
      { isMobile ?
        <TokenSelectMobile data={ data } isLoading={ tokensIsFetching === 1 }/> :
        <TokenSelectDesktop data={ data } isLoading={ tokensIsFetching === 1 }/>
      }
      <Tooltip content="Show all tokens">
        <IconButton
          aria-label="Show all tokens"
          variant="icon_background"
          size="md"
          onClick={ handleIconButtonClick }
        >
          <WalletIcon width="20" height="20" style={{ color: 'currentColor', display: 'block' }}/>
        </IconButton>
      </Tooltip>
    </Flex>
  );
};

export default React.memo(TokenSelect);
