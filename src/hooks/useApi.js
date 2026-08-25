import React, { useEffect, useState } from 'react';

// Minimal data-fetching hook: loading / error / data states.
export function useApi(fn, deps = []) {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => {
        if (active) setState({ loading: false, error: null, data });
      })
      .catch((error) => {
        if (active) setState({ loading: false, error: error.message, data: null });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refresh = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((error) => setState({ loading: false, error: error.message, data: null }));
  };

  return { ...state, refresh };
}
