import { useState, useEffect, useCallback } from "react";
 
export function useApi(apiFunc, immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFunc(...args);
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);
 
  useEffect(() => {
    if (immediate) execute();
  }, []);
 
  return { data, loading, error, execute };
}
