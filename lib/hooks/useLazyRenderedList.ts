import React from 'react';

export default function useLazyRenderedList<T>(
  items: Array<T>,
  options?: { batchSize?: number },
): { renderedItemsNum: number; cutRef: React.RefObject<HTMLDivElement> } {
  const { batchSize = 20 } = options || {};
  const [ renderedItemsNum, setRenderedItemsNum ] = React.useState(batchSize);
  const cutRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setRenderedItemsNum(Math.min(batchSize, items.length));
  }, [ items.length, batchSize ]);

  React.useEffect(() => {
    if (!cutRef.current || renderedItemsNum >= items.length) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setRenderedItemsNum((prev) => Math.min(prev + batchSize, items.length));
      }
    });
    observer.observe(cutRef.current);
    return () => observer.disconnect();
  }, [ batchSize, items.length, renderedItemsNum ]);

  return { renderedItemsNum, cutRef };
}
