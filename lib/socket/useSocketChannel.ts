import React from 'react';

export default function useSocketChannel(options: {
  topic: string;
  isDisabled?: boolean;
  onJoin?: () => void;
  onSocketClose?: () => void;
  onSocketError?: () => void;
}) {
  const { isDisabled, onJoin } = options;
  const onJoinRef = React.useRef(onJoin);
  onJoinRef.current = onJoin;

  React.useLayoutEffect(() => {
    if (isDisabled) {
      return;
    }
    onJoinRef.current?.();
  }, [ isDisabled ]);

  return null;
}
