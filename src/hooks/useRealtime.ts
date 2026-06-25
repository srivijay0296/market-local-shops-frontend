import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * ⚡ useRealtime Hook
 * Subscribes to a Supabase table and keeps the local state in sync.
 * @param table - The table name to subscribe to.
 * @param initialData - Initial data to populate the state.
 */
export function useRealtime<T extends { id: string }>(table: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);

  useEffect(() => {
    // 1. Initial Fetch (Optional, if initialData is provided)
    if (initialData.length > 0) setData(initialData);

    // 2. Setup Subscription
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          console.log(`⚡ Realtime change on ${table}:`, payload);
          
          const { eventType, new: newItem, old: oldItem } = payload;

          if (eventType === 'INSERT') {
            setData((prev) => [newItem as T, ...prev]);
          } else if (eventType === 'UPDATE') {
            setData((prev) => prev.map((item) => (item.id === newItem.id ? (newItem as T) : item)));
          } else if (eventType === 'DELETE') {
            setData((prev) => prev.filter((item) => item.id !== oldItem.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, initialData]);

  return { data, setData };
}
