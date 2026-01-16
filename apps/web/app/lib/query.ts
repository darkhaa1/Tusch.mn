type SearchParamsLike = {
  get: (key: string) => string | null;
  toString: () => string;
};

type SearchParamsPatch = Record<string, string | number | boolean | null | undefined>;

export function getNumberParam(
  searchParams: SearchParamsLike,
  key: string,
  defaultValue: number
): number {
  const raw = searchParams.get(key);
  if (!raw) return defaultValue;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return defaultValue;
  const normalized = Math.floor(parsed);
  return normalized >= 1 ? normalized : defaultValue;
}

export function setSearchParams(current: SearchParamsLike, patch: SearchParamsPatch): string {
  const params = new URLSearchParams(current.toString());
  Object.entries(patch).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      params.delete(key);
      return;
    }
    params.set(key, String(value));
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

