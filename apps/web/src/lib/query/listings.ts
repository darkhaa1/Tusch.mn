import { getNumberParam, setSearchParams } from "./index";
import type { SearchParamsLike } from "./index";

type ListingsQueryDefaults = {
  page: number;
  limit: number;
  sort: string;
};

type ListingsQueryState = {
  page: number;
  limit: number;
  sort: string;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
};

type ListingsQueryPatch = Partial<
  Omit<ListingsQueryState, "category" | "search" | "minPrice" | "maxPrice" | "location">
> & {
  category?: string | null;
  search?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  location?: string | null;
};

const normalizeParam = (value: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const getOptionalNumberParam = (
  searchParams: SearchParamsLike,
  key: string,
): number | undefined => {
  const raw = searchParams.get(key);
  if (!raw) return undefined;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.floor(parsed);
};

export function parseListingsQuery(
  searchParams: SearchParamsLike,
  defaults: ListingsQueryDefaults
): ListingsQueryState {
  return {
    page: getNumberParam(searchParams, "page", defaults.page),
    limit: getNumberParam(searchParams, "limit", defaults.limit),
    sort: normalizeParam(searchParams.get("sort")) || defaults.sort,
    category: normalizeParam(searchParams.get("category")),
    search: normalizeParam(searchParams.get("search")),
    minPrice: getOptionalNumberParam(searchParams, "minPrice"),
    maxPrice: getOptionalNumberParam(searchParams, "maxPrice"),
    location: normalizeParam(searchParams.get("location")),
  };
}

export function buildListingsQuery(
  searchParams: SearchParamsLike,
  patch: ListingsQueryPatch
): string {
  return setSearchParams(searchParams, {
    page: patch.page,
    limit: patch.limit,
    sort: patch.sort,
    category: patch.category,
    search: patch.search,
    minPrice: patch.minPrice,
    maxPrice: patch.maxPrice,
    location: patch.location,
  });
}
