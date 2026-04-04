import { Flex } from '@chakra-ui/react';
import React from 'react';

import NativeTokenIcon from 'ui/shared/NativeTokenIcon';
import type { Props as NativeCoinValueProps } from 'ui/shared/value/NativeCoinValue';
import NativeCoinValue from 'ui/shared/value/NativeCoinValue';

import { ItemValue } from './DetailedInfo';

interface Props extends NativeCoinValueProps {}

const DetailedInfoNativeCoinValue = ({ ...rest }: Props) => {
  return (
    <ItemValue multiRow>
      <Flex alignItems="center" flexWrap="wrap" gap={ 1 }>
        <NativeTokenIcon boxSize={ 5 } isLoading={ rest.loading }/>
        <NativeCoinValue
          accuracy={ 0 }
          flexWrap="wrap"
          rowGap={ 0 }
          { ...rest }
        />
      </Flex>
    </ItemValue>
  );
};

export default React.memo(DetailedInfoNativeCoinValue);
