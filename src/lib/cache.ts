// ⚡ NEXUS HIGH-CONCURRENCY CACHE (Frontend)
// Optimized for 10,000+ users. Prevents redundant API roundtrips.

type CacheEntry = {
  data: any;
  timestamp: number;
};

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 60000; // 1 minute

export const nexusCache = {
  set(key: string, data: any, ttl = DEFAULT_TTL) {
    cache.set(key, { data, timestamp: Date.now() + ttl });
  },

  get(key: string) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.timestamp) {
      cache.delete(key);
      return null;
    }
    return entry.data;
  },

  clear() {
    cache.clear();
  }
};
