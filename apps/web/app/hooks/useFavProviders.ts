"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "tusch:favProviders";

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeStorage(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useFavProviders() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readStorage());
  }, []);

  const idSet = useMemo(() => new Set(ids), [ids]);

  const add = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setIds((prev) => {
      if (!prev.includes(id)) return prev;
      const next = prev.filter((item) => item !== id);
      writeStorage(next);
      return next;
    });
  }, []);

  const has = useCallback((id: string) => idSet.has(id), [idSet]);

  const list = useCallback(() => ids, [ids]);

  return { ids, add, remove, has, list };
}

export default useFavProviders;
