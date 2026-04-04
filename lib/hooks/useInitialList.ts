import React from 'react';

interface Params<T> {
  data: Array<T>;
  idFn: (item: T) => string | number;
  enabled: boolean;
}

interface InitialList<T> {
  getAnimationProp: (item: T) => 'fade-in' | 'slide-in' | undefined;
}

export default function useInitialList<T>({ data, idFn, enabled }: Params<T>): InitialList<T> {
  const initialIdsRef = React.useRef<Set<string | number> | null>(null);

  if (enabled && initialIdsRef.current === null) {
    initialIdsRef.current = new Set(data.map(idFn));
  }

  const getAnimationProp = React.useCallback((item: T): 'fade-in' | 'slide-in' | undefined => {
    if (!enabled || initialIdsRef.current === null) return undefined;
    const id = idFn(item);
    if (initialIdsRef.current.has(id)) return undefined;
    return 'slide-in';
  }, [ enabled, idFn ]);

  return { getAnimationProp };
}
