import { useEffect, useState } from 'react';

/**
 * ⚡ useRealtime Hook - Stub for Spring Boot migration.
 * WebSocket/realtime support can be re-added via Spring Boot's WebSocket endpoints.
 * For now, this returns the initial data and a setter for manual state updates.
 */
export function useRealtime<T extends { id: string }>(table: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);

  useEffect(() => {
    if (initialData.length > 0) setData(initialData);
    // NOTE: Realtime removed. Implement polling or Spring Boot WebSocket here if needed.
    console.info(`[useRealtime] Passive mode for table: ${table}. Realtime updates not active.`);
  }, [table]);

  return { data, setData };
}
