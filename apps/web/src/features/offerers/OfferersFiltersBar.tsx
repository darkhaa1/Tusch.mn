"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, ShieldCheck, FilterX } from "lucide-react";
import { Card, CardContent, Input } from "@web/components/ui";
import { CATEGORY_OPTIONS } from "@web/lib/category-ui";
import { MN_LOCATIONS } from "@repo/shared";
import { getNumberParam, setSearchParams } from "@web/lib/query";
import { cn } from "@web/lib/utils";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}

const normalizeText = (value: string | null) => {
  if (!value) return "";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "";
};

export default function OfferersFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const qParam = normalizeText(searchParams.get("q"));
  const [searchValue, setSearchValue] = useState(qParam);
  const debouncedSearch = useDebouncedValue(searchValue, 300);

  useEffect(() => {
    setSearchValue(qParam);
  }, [qParam]);

  const category = normalizeText(searchParams.get("category")) || undefined;
  const city = normalizeText(searchParams.get("city")) || undefined;
  const verifiedParam = searchParams.get("verified") === "true";
  const limit = getNumberParam(searchParams, "limit", DEFAULT_LIMIT);

  useEffect(() => {
    const nextQ = debouncedSearch.trim();
    if (nextQ === qParam) return;
    const query = setSearchParams(searchParams, {
      q: nextQ || null,
      page: 1,
    });
    router.push(`/offerers${query}`);
  }, [debouncedSearch, qParam, router, searchParams]);

  const updateCategory = (nextCategory?: string | null) => {
    const query = setSearchParams(searchParams, {
      page: 1,
      limit,
      q: qParam || null,
      category: nextCategory || null,
    });
    router.push(`/offerers${query}`);
  };

  const updateCity = (nextCity?: string | null) => {
    const query = setSearchParams(searchParams, {
      page: 1,
      limit,
      q: qParam || null,
      category: category || null,
      city: nextCity || null,
    });
    router.push(`/offerers${query}`);
  };

  const toggleVerified = () => {
    const query = setSearchParams(searchParams, {
      page: 1,
      limit,
      q: qParam || null,
      category: category || null,
      verified: verifiedParam ? null : "true",
    });
    router.push(`/offerers${query}`);
  };

  const resetFilters = () => {
    setSearchValue("");
    const query = setSearchParams(searchParams, {
      page: 1,
      limit,
      q: null,
      category: null,
      city: null,
      verified: null,
    });
    router.push(`/offerers${query}`);
  };

  return (
    <>
      <Card className="mt-6 border-border/80">
        <CardContent className="space-y-3 p-4">
          <div className="grid gap-3 md:grid-cols-[1.5fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Үйлчилгээ эсвэл нэрээр хайх"
                className="pl-10"
                aria-label="Хайх"
              />
            </div>
            <div className="relative hidden md:block">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Байршил"
                className="pl-10"
                aria-label="Байршил"
                disabled
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              Хайлтаар нэр, овгоор шүүнэ. Ангиллаар нарийвчилж болно.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleVerified}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition",
                  verifiedParam
                    ? "border-green-400 bg-green-50 text-green-700 hover:bg-green-100"
                    : "border-border/70 text-foreground hover:bg-muted/70 ui-interactive",
                )}
              >
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                Баталгаажсан
              </button>
              {(qParam || category || city || verifiedParam) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-xs text-foreground transition hover:bg-muted/70",
                    "ui-interactive",
                  )}
                >
                  <FilterX className="h-3 w-3" aria-hidden="true" />
                  Шүүлтийг цэвэрлэх
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Ангилал</p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6">
        <button
          type="button"
          onClick={() => updateCategory(null)}
          className={cn(
            "flex min-h-22 w-full flex-col items-center justify-center rounded-2xl border px-3 py-3 text-xs font-medium transition",
            !category
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border bg-muted text-foreground hover:bg-muted/70",
          )}
        >
          <span className="text-xs font-semibold text-center">Бүгд</span>
        </button>
        {CATEGORY_OPTIONS.map((item) => {
          const Icon = item.icon;
          const active = category === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => updateCategory(item.value)}
              className={cn(
                "flex min-h-2 w-full flex-col items-center justify-center gap-2 rounded-2xl border px-1 py-1 text-xs font-medium transition",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-muted text-foreground hover:bg-muted/70",
              )}
            >
              <Icon className="h-6 w-6 md:h-7 md:w-7" aria-hidden="true" />
              <span className="text-xs font-semibold text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Хот / Байршил
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateCity(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-sm font-medium transition",
            !city
              ? "border-primary bg-primary text-primary-foreground shadow-sm"
              : "border-border/70 text-foreground hover:bg-muted/70",
          )}
        >
          Бүгд
        </button>
        {MN_LOCATIONS.map((loc) => (
          <button
            key={loc.city}
            type="button"
            onClick={() => updateCity(city === loc.city ? null : loc.city)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition",
              city === loc.city
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border/70 text-foreground hover:bg-muted/70",
            )}
          >
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {loc.city}
          </button>
        ))}
      </div>
    </>
  );
}
