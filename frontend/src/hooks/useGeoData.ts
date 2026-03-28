import { useState, useEffect } from 'react';
import { fetchGeoJson } from '../lib/mapUtils';

export interface GeoDataState {
  data: any | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and manage GeoJSON data with caching.
 */
export const useGeoData = (url: string | null) => {
  const [state, setState] = useState<GeoDataState>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!url) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const data = await fetchGeoJson(url);
        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (err) {
        if (isMounted) {
          setState({ data: null, loading: false, error: err as Error });
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return state;
};
