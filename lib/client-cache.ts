"use client";

import * as React from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

// Default cache TTL: 5 minutes (300,000 ms)
const DEFAULT_TTL_MS = 5 * 60 * 1000;

/**
 * Retrieves cached data if present and unexpired.
 */
export function getCachedData<T>(key: string, ttlMs: number = DEFAULT_TTL_MS): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > ttlMs;
  if (isExpired) {
    memoryCache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Checks if active unexpired cached data exists for the given key.
 */
export function hasCachedData(key: string, ttlMs: number = DEFAULT_TTL_MS): boolean {
  return getCachedData(key, ttlMs) !== null;
}

/**
 * Sets or updates data in the memory cache.
 */
export function setCachedData<T>(key: string, data: T): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Clears a specific key or the entire client cache.
 */
export function clearCachedData(keyPrefix?: string): void {
  if (!keyPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(keyPrefix)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * React hook to initialize state with cached data for instant 0ms navigation.
 * Automatically handles stale-while-revalidate patterns without UI flicker.
 */
export function useCachedState<T>(
  key: string,
  fallback: T,
  ttlMs: number = DEFAULT_TTL_MS
): [T, React.Dispatch<React.SetStateAction<T>>, boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const cached = React.useMemo(() => getCachedData<T>(key, ttlMs), [key, ttlMs]);

  const [data, setDataInternal] = React.useState<T>(() => (cached !== null ? cached : fallback));
  const [isLoading, setIsLoading] = React.useState<boolean>(() => cached === null);

  const setData: React.Dispatch<React.SetStateAction<T>> = React.useCallback(
    (action) => {
      setDataInternal((prev) => {
        const next = typeof action === "function" ? (action as (prev: T) => T)(prev) : action;
        setCachedData(key, next);
        return next;
      });
    },
    [key]
  );

  return [data, setData, isLoading, setIsLoading];
}
