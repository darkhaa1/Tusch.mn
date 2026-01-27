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
};

type ListingsQueryPatch = Partial<Omit<ListingsQueryState, "category">> & {
  category?: string | null;
};

const normalizeParam = (value: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
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
  });
}
