import { useCallback, useEffect, useState } from "react";

/**
 * On iOS a React Native `Modal` that is dismissed in the same frame another one
 * is presented leaks its native window: an invisible layer keeps swallowing
 * touches and the app looks frozen (facebook/react-native#50152).
 *
 * Screens here close a sheet and immediately open something else (menu -> edit
 * sheet, menu -> system alert). This hook defers that second step until the
 * first modal has finished dismissing.
 */
const DISMISS_MS = 350;

export function useModalHandoff(): (run: () => void) => void {
  const [pending, setPending] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => {
      setPending(null);
      pending();
    }, DISMISS_MS);
    return () => clearTimeout(timer);
  }, [pending]);

  return useCallback((run: () => void) => {
    setPending(() => run);
  }, []);
}
