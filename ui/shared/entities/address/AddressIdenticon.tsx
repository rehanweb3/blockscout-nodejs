import { Box } from '@chakra-ui/react';
import React from 'react';

interface Props {
  hash: string;
  size: number;
}

const AddressIdenticon = ({ size, hash }: Props) => {
  const [ svgHtml, setSvgHtml ] = React.useState<string>('');

  React.useEffect(() => {
    let cancelled = false;
    import('blo').then(({ bloSvg }) => {
      if (cancelled) return;
      try {
        const svg = bloSvg(hash as `0x${ string }`);
        setSvgHtml(svg);
      } catch {
        // hash might be malformed — silent fallback
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [ hash ]);

  return (
    <Box
      boxSize={ `${ size }px` }
      borderRadius="full"
      overflow="hidden"
      flexShrink={ 0 }
      bg={ svgHtml ? undefined : 'gray.200' }
      dangerouslySetInnerHTML={ svgHtml ? { __html: svgHtml } : undefined }
      sx={{
        '& svg': {
          width: `${ size }px`,
          height: `${ size }px`,
          display: 'block',
        },
      }}
    />
  );
};

export default React.memo(AddressIdenticon);
