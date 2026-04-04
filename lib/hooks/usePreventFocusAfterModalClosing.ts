import { useCallback } from 'react';

export default function usePreventFocusAfterModalClosing() {
  return useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);
}
