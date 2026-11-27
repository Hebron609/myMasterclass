"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePageLoading } from "@/context/PageLoadingContext";
import { useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/api";

/** The key describes all inputs besides the token. Old responses cannot overwrite a new selection. */
export function useApiResource<T>(
  key: string,
  loader: (token: string) => Promise<T>,
  enabled = true,
) {
  const { token, isLoading: authLoading } = useAuth();
  const loadRef = useRef(loader);
  loadRef.current = loader;
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
    identity: string;
  }>({ data: null, loading: true, error: null, identity: "" });

  const identity = `${token}:${key}:${enabled}:${version}`;

  // Only trigger full page loading overlay during initial data acquisition
  const isInitialPending =
    Boolean(enabled) &&
    (authLoading ||
      (Boolean(token) && state.data === null && state.loading));

  usePageLoading(isInitialPending);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  useEffect(() => {
    let current = true;
    if (!token || !enabled) {
      setState({ data: null, loading: false, error: null, identity });
      return;
    }
    setState((prev) => ({
      data: prev.data,
      loading: true,
      error: null,
      identity,
    }));
    loadRef
      .current(token)
      .then((data) => {
        if (current) setState({ data, loading: false, error: null, identity });
      })
      .catch((error: unknown) => {
        if (current)
          setState((prev) => ({
            data: prev.data,
            loading: false,
            error: errorMessage(error),
            identity,
          }));
      });
    return () => {
      current = false;
    };
  }, [token, key, identity, version, enabled]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    reload,
  };
}
