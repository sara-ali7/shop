"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export function useAsync<T>(fn: () => Promise<T>, deps: readonly unknown[], enabled = true) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, error: null, loading: enabled });
  const [attempt, setAttempt] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setState((prev) => ({ data: prev.data, error: null, loading: true }));
    fnRef
      .current()
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((error: unknown) => {
        if (!active) return;
        setState({
          data: null,
          error: error instanceof Error ? error : new Error(String(error)),
          loading: false,
        });
      });
    return () => {
      active = false;
    };
  }, [...deps, attempt, enabled]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, reload };
}
