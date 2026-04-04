import React from 'react';

import useIsMounted from 'lib/hooks/useIsMounted';

interface Props {
  children: React.ReactNode;
  content: React.ReactNode;
}

const chromeMountStyle: React.CSSProperties = {
  animation: 'layoutFadeIn 120ms ease-out',
};

if (typeof document !== 'undefined') {
  const styleId = '__layout-fadein';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = '@keyframes layoutFadeIn{from{opacity:0}to{opacity:1}}';
    document.head.appendChild(style);
  }
}

const Root = ({ children, content }: Props) => {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return content;
  }

  return (
    <div style={ chromeMountStyle }>
      { children }
    </div>
  );
};

export default React.memo(Root);
