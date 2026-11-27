"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { PageLoader } from "@/components/shared/PageLoader";

type PageLoadingContextType = {
  registerResource: (id: string, pending: boolean) => void;
  startNavigation: () => void;
};

const PageLoadingContext = createContext<PageLoadingContextType | null>(null);

/** Register before paint so neither initial nor route requests reveal partial UI. */
export function usePageLoading(pending: boolean) {
  const context = useContext(PageLoadingContext);
  const id = useId();
  useLayoutEffect(() => {
    context?.registerResource(id, pending);
    return () => context?.registerResource(id, false);
  }, [context, id, pending]);
}

/** Hook to trigger the loading screen immediately on link click / route navigation. */
export function usePageLoadingTrigger() {
  const context = useContext(PageLoadingContext);
  return useCallback(() => {
    context?.startNavigation();
  }, [context]);
}

export function useNavigationLoading(pending: boolean) {
  const context = useContext(PageLoadingContext);
  const id = useId();
  useLayoutEffect(() => {
    context?.registerResource(`nav-${id}`, pending);
    return () => context?.registerResource(`nav-${id}`, false);
  }, [context, id, pending]);
}

const MINIMUM_DISPLAY_MS = 280;
const SAFETY_TIMEOUT_MS = 8000;

export function PageLoadingBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeRequests = useRef(new Set<string>());
  const [, setRequestCount] = useState(0);

  const [isBusy, setIsBusy] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const navigationStartTime = useRef<number>(Date.now());
  const currentPathname = useRef<string>(pathname);
  const pendingTimer = useRef<NodeJS.Timeout | null>(null);
  const safetyTimer = useRef<NodeJS.Timeout | null>(null);

  const finishLoading = useCallback(() => {
    if (pendingTimer.current) {
      clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }
    const elapsed = Date.now() - navigationStartTime.current;
    const remaining = Math.max(0, MINIMUM_DISPLAY_MS - elapsed);

    pendingTimer.current = setTimeout(() => {
      setIsFadingOut(true);
      pendingTimer.current = setTimeout(() => {
        setIsBusy(false);
        setIsFadingOut(false);
      }, 300);
    }, remaining);
  }, []);

  const registerResource = useCallback(
    (id: string, pending: boolean) => {
      const changed = pending
        ? !activeRequests.current.has(id)
        : activeRequests.current.has(id);
      if (!changed) return;

      if (pending) {
        activeRequests.current.add(id);
      } else {
        activeRequests.current.delete(id);
      }
      setRequestCount(activeRequests.current.size);

      // If all registered requests are resolved and we're currently loading:
      if (isBusy && activeRequests.current.size === 0) {
        finishLoading();
      }
    },
    [isBusy, finishLoading],
  );

  const startNavigation = useCallback(() => {
    if (pendingTimer.current) {
      clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }
    navigationStartTime.current = Date.now();
    activeRequests.current.clear();
    setRequestCount(0);
    setIsFadingOut(false);
    setIsBusy(true);

    // Arm safety timeout to ensure screen is never permanently locked
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    safetyTimer.current = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsBusy(false);
        setIsFadingOut(false);
      }, 300);
    }, SAFETY_TIMEOUT_MS);
  }, []);

  // When pathname changes (either via link click or browser back/forward)
  useEffect(() => {
    if (currentPathname.current !== pathname) {
      currentPathname.current = pathname;
      startNavigation();
    }
  }, [pathname, startNavigation]);

  // Initial load check: if no resources registered after mounting cycle, finish loading
  useEffect(() => {
    const initialCheck = setTimeout(() => {
      if (activeRequests.current.size === 0) {
        finishLoading();
      }
    }, 150);

    return () => {
      clearTimeout(initialCheck);
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, [pathname, finishLoading]);

  // Prevent scrolling while loading overlay is visible
  useLayoutEffect(() => {
    if (!isBusy) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isBusy]);

  const contextValue = useMemo(
    () => ({ registerResource, startNavigation }),
    [registerResource, startNavigation],
  );

  return (
    <PageLoadingContext.Provider value={contextValue}>
      {isBusy && <PageLoader isFadingOut={isFadingOut} />}
      <div
        aria-busy={isBusy}
        aria-hidden={isBusy || undefined}
        inert={isBusy}
        style={isBusy ? { visibility: "hidden" } : undefined}
      >
        {children}
      </div>
    </PageLoadingContext.Provider>
  );
}
