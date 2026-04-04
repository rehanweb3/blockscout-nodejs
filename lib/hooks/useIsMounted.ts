import React from 'react';

export default function useIsMounted(): boolean {
  const [ isMounted, setIsMounted ] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return isMounted;
}
