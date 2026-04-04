import { useEffect, useRef } from 'react';

export default function useUpdateValueEffect<T>(callback: () => void, value: T) {
  const prevRef = useRef<T>(value);
  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value;
      callback();
    }
  }, [ value, callback ]);
}
