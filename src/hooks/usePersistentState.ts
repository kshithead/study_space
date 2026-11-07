import { useCallback, useState } from "react";

/**
 * Browser-side persisted state for the frontend prototype — no backend yet,
 * so user state (bookmarks, notes, quiz scores…) lives in localStorage.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage unavailable (private mode) — keep going with in-memory state
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update] as const;
}
