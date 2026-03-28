/**
 * Normalizes state and district names for reliable comparison.
 * Handles casing, whitespace, underscores, and hyphens.
 */
export const normalizeName = (name: string): string => {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[_\-\s]+/g, " ");
};

/**
 * Helper for safe comparison between two names.
 */
export const safeCompare = (a: string, b: string): boolean => {
  return normalizeName(a) === normalizeName(b);
};

/**
 * Handle known mismatches between datasets.
 * Map common variations to a standard name.
 */
export const STATE_NAME_MAPPING: Record<string, string> = {
  "andaman and nicobar islands": "andaman and nicobar",
  "jammu and kashmir": "jammu & kashmir",
  "daman and diu": "daman & diu",
  "dadra and nagar haveli": "dadra & nagar haveli",
  "lakshadweep islands": "lakshadweep",
  "odisha": "orissa", // Depending on which dataset is "standard"
};

/**
 * Standardizes a name using the mapping table.
 */
export const standardizeName = (name: string): string => {
  const normalized = normalizeName(name);
  return STATE_NAME_MAPPING[normalized] || normalized;
};

// Cache for GeoJSON data
const geoCache: Record<string, any> = {};

/**
 * Fetches GeoJSON data with caching.
 */
export const fetchGeoJson = async (url: string): Promise<any> => {
  if (geoCache[url]) {
    console.debug(`[MapUtils] Cache hit for ${url}`);
    return geoCache[url];
  }

  try {
    console.debug(`[MapUtils] Fetching ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    geoCache[url] = data;
    return data;
  } catch (error) {
    console.error(`[MapUtils] Failed to fetch GeoJSON from ${url}`, error);
    throw error;
  }
};
