import { useEffect, useState, useCallback } from "react";

// -------------------------------------------------------------------------
// useAnalytics
// -------------------------------------------------------------------------
// A tiny generic hook every page uses to call a function from `api.js` and
// automatically track loading / error / data state.
//
// Usage:
//   const { data, loading, error, reload } = useAnalytics(getDashboardData);
//
// `deps` (optional) re-runs the fetch whenever those values change - handy
// for date-range or platform filters.
// -------------------------------------------------------------------------
export function useAnalytics(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchFn()
      .then((result) => setData(result))
      .catch((err) => setError(err.message || "Something went wrong"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
