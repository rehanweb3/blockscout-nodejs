import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import React from 'react';

import IconSvg from 'ui/shared/IconSvg';

interface Props extends BoxProps {
  symbol?: string | null;
  hash?: string | null;
}

function hashToHue(hash: string): number {
  let h = 0;
  for (let i = 2; i < Math.min(hash.length, 10); i++) {
    h = (h * 31 + hash.charCodeAt(i)) & 0xffff;
  }
  return h % 360;
}

const TokenLogoPlaceholder = ({ symbol, hash, ...props }: Props) => {
  if (symbol && hash) {
    const hue = hashToHue(hash);
    const letter = symbol.charAt(0).toUpperCase();

    return (
      <Box
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="base"
        flexShrink={ 0 }
        w="100%"
        h="100%"
        minW="20px"
        minH="20px"
        style={{ backgroundColor: `hsl(${ hue }, 65%, 50%)`, color: '#fff', fontSize: '10px', fontWeight: 700, lineHeight: 1 }}
        { ...props }
      >
        { letter }
      </Box>
    );
  }

  return (
    <IconSvg
      fontWeight={ 600 }
      bgColor={{ _light: 'gray.200', _dark: 'gray.600' }}
      color={{ _light: 'gray.400', _dark: 'gray.200' }}
      borderRadius="base"
      name="token-placeholder"
      transitionProperty="background-color,color"
      transitionDuration="normal"
      transitionTimingFunction="ease"
      { ...props }
    />
  );
};

export default TokenLogoPlaceholder;
