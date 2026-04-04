import type { HTMLChakraProps } from '@chakra-ui/react';
import { chakra } from '@chakra-ui/react';
import { type IconName } from 'public/icons/name';
import React from 'react';

import config from 'configs/app';
import { Skeleton } from 'toolkit/chakra/skeleton';

export const href = config.app.spriteHash ? `/icons/sprite.${ config.app.spriteHash }.svg` : '/icons/sprite.svg';

export { IconName };

export interface Props extends HTMLChakraProps<'div'> {
  name: IconName;
  isLoading?: boolean;
}

const IconSvg = React.forwardRef(
  function IconSvg({ name, isLoading = false, ...props }: Props, ref: React.ForwardedRef<HTMLDivElement>) {
    if (isLoading) {
      return (
        <Skeleton loading display="inline-block" flexShrink={ 0 } asChild { ...props } ref={ ref }>
          <chakra.svg w="100%" h="100%">
            <use href={ `${ href }#icon-${ name.replace(/\//g, '-') }` }/>
          </chakra.svg>
        </Skeleton>
      );
    }

    // Use a div container with the sizing/color props, and have the SVG fill it 100%.
    // This is more reliable than styling the SVG element directly via CSS, because SVG
    // elements may require explicit width/height HTML attributes for correct sizing in all
    // rendering contexts. The container div handles all Chakra style props; the SVG fills it.
    return (
      <chakra.div display="inline-block" flexShrink={ 0 } lineHeight={ 0 } { ...props } ref={ ref }>
        <svg width="100%" height="100%" style={{ display: 'block' }}>
          <use href={ `${ href }#icon-${ name.replace(/\//g, '-') }` }/>
        </svg>
      </chakra.div>
    );
  },
);

IconSvg.displayName = 'IconSvg';

export default IconSvg;
