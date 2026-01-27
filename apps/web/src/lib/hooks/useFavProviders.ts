"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "tusch:favProviders";
const listeners = new Set<() => void>();
let cachedIds: string[] = [];
let cachedRaw: string | null = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedIds;
    cachedRaw = raw;
    if (!raw) {
      cachedIds = [];
      return cachedIds;
    }
    const parsed = JSON.parse(raw);
    cachedIds = Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
    return cachedIds;
  } catch {
    cachedRaw = null;
    cachedIds = [];
    return cachedIds;
  }
}

function writeStorage(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window === "undefined") {
    return () => listeners.delete(listener);
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerSnapshot() {
  return cachedIds;
}

export function useFavProviders() {
  const ids = useSyncExternalStore(subscribe, readStorage, getServerSnapshot);
  const idSet = useMemo(() => new Set(ids), [ids]);

  const add = useCallback((id: string) => {
    if (idSet.has(id)) return;
    const next = [...ids, id];
    writeStorage(next);
  }, [idSet, ids]);

  const remove = useCallback((id: string) => {
    if (!idSet.has(id)) return;
    const next = ids.filter((item) => item !== id);
    writeStorage(next);
  }, [idSet, ids]);

  const has = useCallback((id: string) => idSet.has(id), [idSet]);

  const list = useCallback(() => ids, [ids]);

  return { ids, add, remove, has, list };
}

export default useFavProviders;
