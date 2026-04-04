import React from 'react';

export default function useIsInitialLoading(isLoading: boolean): boolean {
  const isInitialLoading = React.useRef(true);

  React.useEffect(() => {
    if (!isLoading) {
      isInitialLoading.current = false;
    }
  }, [ isLoading ]);

  return isLoading && isInitialLoading.current;
}
