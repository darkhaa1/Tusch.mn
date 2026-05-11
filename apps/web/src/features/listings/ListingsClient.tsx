"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Search as SearchIcon, X } from "lucide-react";
import { useListingsPage } from "@web/lib/hooks/useListings";
import { buildListingsQuery, parseListingsQuery } from "@web/lib/query";
import { CATEGORY_OPTIONS } from "@web/lib/category-ui";
import ListingCard from "./ListingCard";
import NewListingModal from "./components/NewListingModal";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const DEFAULT_SORT = "newest";

const labels = {
  pageTitleSingular: "үр дүн",
  back: "Буцах",
  add: "Зар нэмэх",
  searchPlaceholder: "Үйлчилгээ, мастер хайх…",
  searchAria: "Хайх",
  clearAria: "Хайлт цэвэрлэх",
  allChip: "Бүгд",
  sortLabel: "Хамгийн тохиромжтой",
  breadcrumbPrefix: "Хайлт",
  filtersTitle: "Шүүлтүүр",
  filtersApply: "Шүүлтүүр хэрэглэх",
  filtersRating: "Үнэлгээ",
  filtersPrice: "Үнэ",
  filtersDuration: "Хугацаа",
  filtersExperience: "Туршлага",
  resultsSummary: "зарын",
  resultsViewing: "үзэж байна",
  empty: "Илэрц олдсонгүй",
  emptyDescription: "Хайлтын утгаа өөрчилж дахин оролдоно уу.",
  errorTitle: "Алдаа гарлаа",
  retry: "Дахин ачаалах",
  loading: "Уншиж байна…",
  prev: "Өмнөх",
  next: "Дараах",
  noQuery: "бүх зар",
  countListings: "зар",
  ratingOptions: ["★ 4,5+", "★ 4,0+", "Бүгд"],
  priceOptions: ["< 50,000₮", "50,000 – 200,000₮", "200,000₮+"],
  durationOptions: ["24 цаг дотор", "Энэ 7-хоног", "Уян хатан"],
  experienceOptions: ["1+ жил", "5+ жил", "10+ жил"],
};

type DecorativeFilters = {
  rating: number | null;
  price: number | null;
  duration: number | null;
  experience: number | null;
};

const INITIAL_FILTERS: DecorativeFilters = {
  rating: 0,
  price: null,
  duration: null,
  experience: null,
};

export default function ListingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [decorativeFilters, setDecorativeFilters] =
    useState<DecorativeFilters>(INITIAL_FILTERS);

  const { category, page, limit, sort, search, minPrice, maxPrice, location } =
    parseListingsQuery(searchParams, {
      page: DEFAULT_PAGE,
      limit: DEFAULT_LIMIT,
      sort: DEFAULT_SORT,
    });

  const [searchValue, setSearchValue] = useState(search ?? "");

  // Keep the input in sync with the URL on browser nav (back/forward).
  useEffect(() => {
    const handlePopState = () => {
      const next = new URLSearchParams(window.location.search);
      setSearchValue(next.get("search") ?? "");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Debounced push of the search term into URL params.
  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = searchValue.trim();
      const currentSearch = search ?? "";
      if (trimmed === currentSearch) return;
      const query = buildListingsQuery(searchParams, {
        page: 1,
        limit,
        sort,
        category,
        search: trimmed.length ? trimmed : null,
        minPrice,
        maxPrice,
        location,
      });
      router.push(`/listings${query}`);
    }, 300);
    return () => clearTimeout(handle);
  }, [
    searchValue,
    search,
    category,
    limit,
    sort,
    minPrice,
    maxPrice,
    location,
    searchParams,
    router,
  ]);

  const { data, isLoading, error, refetch, isFetching } = useListingsPage({
    category,
    page,
    limit,
    sort,
    search,
    minPrice,
    maxPrice,
    location,
  });

  const items = data?.items ?? [];
  const resolvedPage = data?.page ?? page;
  const resolvedLimit = data?.limit ?? limit;
  const totalKnown = typeof data?.total === "number" && data.total >= 0;
  const total = totalKnown ? data!.total : 0;
  const totalPages =
    totalKnown && resolvedLimit > 0 ? Math.ceil(total / resolvedLimit) : 0;
  const hasPrevious = resolvedPage > 1;
  const hasNext = totalKnown
    ? resolvedPage < totalPages
    : items.length === resolvedLimit;
  const rangeFrom = totalKnown ? (resolvedPage - 1) * resolvedLimit + 1 : 0;
  const rangeTo = totalKnown
    ? Math.min(rangeFrom + items.length - 1, total)
    : items.length;

  const handleCategoryClick = (value: string | null) => {
    const query = buildListingsQuery(searchParams, {
      page: 1,
      limit,
      sort,
      category: value,
      search,
      minPrice,
      maxPrice,
      location,
    });
    router.push(`/listings${query}`);
  };

  const updatePage = (nextPage: number) => {
    const query = buildListingsQuery(searchParams, {
      page: nextPage,
      limit,
      category,
      sort,
      search,
      minPrice,
      maxPrice,
      location,
    });
    router.push(`/listings${query}`);
  };

  const clearSearch = () => {
    setSearchValue("");
  };

  const headlineNumber = totalKnown ? total : items.length;
  const headlineQuery = search?.trim();

  return (
    <div
      className="min-h-screen pb-24 md:pb-0"
      style={{
        background: "var(--at-paper)",
        color: "var(--at-ink)",
        fontFamily: "var(--at-sans)",
      }}
    >
      {/* ── Mobile header ─────────────────────────────────────────── */}
      <div className="md:hidden">
        <div style={{ padding: "4px 20px 12px" }}>
          <div className="mb-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                background: "transparent",
                border: "none",
                color: "var(--at-ink)",
                padding: 0,
              }}
              aria-label={labels.back}
            >
              <ArrowLeft style={{ width: 20, height: 20, strokeWidth: 1.8 }} />
            </button>
            <div
              className="flex flex-1 items-center gap-2"
              style={{
                background: "var(--at-paper)",
                border: "1px solid var(--at-ink)",
                padding: "11px 12px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 10,
                  color: "var(--at-muted)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Q
              </span>
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={labels.searchPlaceholder}
                aria-label={labels.searchAria}
                className="min-w-0 flex-1 outline-none"
                style={{
                  fontSize: 13,
                  color: "var(--at-ink)",
                  background: "transparent",
                  border: "none",
                }}
              />
              {searchValue ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label={labels.clearAria}
                  className="inline-flex items-center justify-center"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--at-muted)",
                    padding: 0,
                  }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              ) : null}
            </div>
          </div>
          {/* Category chips — horizontal scroll */}
          <div
            className="flex gap-1.5 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <CategoryChip
              active={!category}
              onClick={() => handleCategoryClick(null)}
              label={labels.allChip}
            />
            {CATEGORY_OPTIONS.map((opt) => (
              <CategoryChip
                key={opt.value}
                active={category === opt.value}
                onClick={() => handleCategoryClick(opt.value)}
                label={opt.label}
              />
            ))}
          </div>
        </div>

        {/* Result count headline (mobile) */}
        <div
          className="flex items-baseline justify-between"
          style={{
            padding: "14px 20px 12px",
            borderTop: "1px solid var(--at-line)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--at-serif)",
              fontSize: 22,
              fontWeight: 500,
              margin: 0,
              letterSpacing: "-0.02em",
              color: "var(--at-ink)",
            }}
          >
            <em
              style={{ fontStyle: "var(--at-italic-style, italic)" }}
            >
              {headlineNumber}
            </em>{" "}
            {labels.countListings}
          </h2>
          <span
            style={{
              fontFamily: "var(--at-mono)",
              fontSize: 10,
              color: "var(--at-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            ↓ {labels.sortLabel}
          </span>
        </div>

        {/* Mobile list */}
        <div>
          {isLoading ? (
            <MobileSkeleton count={Math.min(resolvedLimit, 6)} />
          ) : error ? (
            <MobileError
              message={(error as Error).message}
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          ) : items.length === 0 ? (
            <MobileEmpty />
          ) : (
            items.map((listing, idx) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                priority={idx === 0}
              />
            ))
          )}
        </div>

        {/* Mobile pagination */}
        {!isLoading && !error && items.length > 0 ? (
          <MobilePagination
            page={resolvedPage}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPageChange={updatePage}
          />
        ) : null}
      </div>

      {/* ── Desktop layout ────────────────────────────────────────── */}
      <div className="hidden md:block">
        {/* Hero section */}
        <section
          style={{
            padding: "36px 56px 24px",
            background: "var(--at-cream)",
            borderBottom: "1px solid var(--at-line)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--at-mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--at-muted)",
            }}
          >
            {labels.breadcrumbPrefix}
            {headlineQuery ? ` → «${headlineQuery}»` : ""}
            {category
              ? ` → ${
                  CATEGORY_OPTIONS.find((c) => c.value === category)?.label ??
                  category
                }`
              : ""}
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-6">
            <h1
              style={{
                fontFamily: "var(--at-serif)",
                fontSize: 56,
                fontWeight: 400,
                letterSpacing: "-0.04em",
                margin: 0,
                color: "var(--at-ink)",
                lineHeight: 1.05,
              }}
            >
              <em
                style={{
                  fontStyle: "var(--at-italic-style, italic)",
                  color: "var(--at-terre)",
                }}
              >
                {headlineNumber}
              </em>{" "}
              {labels.pageTitleSingular}
              {headlineQuery ? (
                <>
                  ,{" "}
                  <em style={{ fontStyle: "var(--at-italic-style, italic)" }}>
                    «{headlineQuery}»
                  </em>
                </>
              ) : (
                ""
              )}
            </h1>
            <div className="flex items-center gap-3">
              {location ? (
                <span
                  style={{
                    fontFamily: "var(--at-mono)",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: "var(--at-muted)",
                    textTransform: "uppercase",
                  }}
                >
                  {location}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2"
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "10px 16px",
                  background: "var(--at-ink)",
                  color: "var(--at-cream)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Plus style={{ width: 14, height: 14 }} aria-hidden="true" />
                {labels.add}
              </button>
            </div>
          </div>

          {/* Desktop search input */}
          <div className="mt-5 flex max-w-2xl items-center gap-2"
               style={{
                 background: "var(--at-paper)",
                 border: "1px solid var(--at-line)",
                 padding: "10px 14px",
               }}>
            <SearchIcon
              style={{
                width: 16,
                height: 16,
                color: "var(--at-muted)",
                strokeWidth: 1.8,
              }}
              aria-hidden="true"
            />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={labels.searchPlaceholder}
              aria-label={labels.searchAria}
              className="min-w-0 flex-1 outline-none"
              style={{
                fontSize: 14,
                background: "transparent",
                border: "none",
                color: "var(--at-ink)",
              }}
            />
            {searchValue ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label={labels.clearAria}
                className="inline-flex items-center justify-center"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--at-muted)",
                  padding: 0,
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            ) : null}
          </div>

          {/* Chip filters */}
          <div className="mt-5 flex flex-wrap gap-2">
            <DesktopChip
              active={!category}
              onClick={() => handleCategoryClick(null)}
              label={labels.allChip}
            />
            {CATEGORY_OPTIONS.map((opt) => (
              <DesktopChip
                key={opt.value}
                active={category === opt.value}
                onClick={() => handleCategoryClick(opt.value)}
                label={opt.label}
              />
            ))}
          </div>
        </section>

        {/* Two-column results section */}
        <section
          className="grid"
          style={{
            gridTemplateColumns: "280px 1fr",
            minHeight: 580,
          }}
        >
          {/* Sidebar filters (decorative — local state only) */}
          <aside
            style={{
              padding: "32px",
              borderRight: "1px solid var(--at-line)",
              background: "var(--at-paper)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--at-mono)",
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--at-muted)",
                marginBottom: 4,
              }}
            >
              {labels.filtersTitle}
            </div>

            <FilterSection
              title={labels.filtersRating}
              options={labels.ratingOptions}
              selected={decorativeFilters.rating}
              onSelect={(idx) =>
                setDecorativeFilters((f) => ({ ...f, rating: idx }))
              }
            />
            <FilterSection
              title={labels.filtersPrice}
              options={labels.priceOptions}
              selected={decorativeFilters.price}
              onSelect={(idx) =>
                setDecorativeFilters((f) => ({ ...f, price: idx }))
              }
            />
            <FilterSection
              title={labels.filtersDuration}
              options={labels.durationOptions}
              selected={decorativeFilters.duration}
              onSelect={(idx) =>
                setDecorativeFilters((f) => ({ ...f, duration: idx }))
              }
            />
            <FilterSection
              title={labels.filtersExperience}
              options={labels.experienceOptions}
              selected={decorativeFilters.experience}
              onSelect={(idx) =>
                setDecorativeFilters((f) => ({ ...f, experience: idx }))
              }
            />

            <button
              type="button"
              onClick={() => {
                /* decorative — no wiring yet */
              }}
              style={{
                marginTop: 32,
                padding: "12px 16px",
                background: "var(--at-ink)",
                color: "var(--at-cream)",
                fontFamily: "var(--at-serif)",
                fontSize: 14,
                fontWeight: 500,
                textAlign: "center",
                width: "100%",
                border: "none",
                cursor: "pointer",
              }}
            >
              {labels.filtersApply}
            </button>
          </aside>

          {/* Results */}
          <div style={{ padding: "32px 56px 60px" }}>
            <div
              className="mb-6 flex items-baseline justify-between"
              style={{ marginBottom: 24 }}
            >
              <div
                style={{
                  fontFamily: "var(--at-serif)",
                  fontSize: 18,
                  fontStyle: "var(--at-italic-style, italic)",
                  color: "var(--at-ink)",
                }}
              >
                {totalKnown ? (
                  <>
                    {total} {labels.resultsSummary}{" "}
                    <em>
                      {rangeFrom}-{rangeTo}
                    </em>{" "}
                    {labels.resultsViewing}
                  </>
                ) : (
                  labels.loading
                )}
              </div>
              <div
                style={{
                  fontFamily: "var(--at-mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--at-muted)",
                }}
              >
                ↓ {labels.sortLabel}
              </div>
            </div>

            {isLoading ? (
              <DesktopSkeleton count={Math.min(resolvedLimit, 6)} />
            ) : error ? (
              <DesktopError
                message={(error as Error).message}
                onRetry={() => refetch()}
                isRetrying={isFetching}
              />
            ) : items.length === 0 ? (
              <DesktopEmpty />
            ) : (
              <div
                className="grid"
                style={{ gridTemplateColumns: "1fr 1fr", gap: 24 }}
              >
                {items.map((listing, idx) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    priority={idx === 0}
                  />
                ))}
              </div>
            )}

            {!isLoading && !error && items.length > 0 ? (
              <DesktopPagination
                page={resolvedPage}
                totalPages={totalKnown ? totalPages : 1}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onPageChange={updatePage}
              />
            ) : null}
          </div>
        </section>
      </div>

      <NewListingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Subcomponents — kept colocated; small enough not to need own files.
// ───────────────────────────────────────────────────────────────────

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "var(--at-mono)",
        fontSize: 10,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "6px 11px",
        background: active ? "var(--at-ink)" : "transparent",
        color: active ? "var(--at-cream)" : "var(--at-ink)",
        border: active ? "none" : "1px solid var(--at-line)",
        whiteSpace: "nowrap",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

function DesktopChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "var(--at-mono)",
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "8px 14px",
        background: active ? "var(--at-ink)" : "transparent",
        color: active ? "var(--at-cream)" : "var(--at-ink)",
        border: active ? "none" : "1px solid var(--at-line)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function FilterSection({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: readonly string[];
  selected: number | null;
  onSelect: (idx: number) => void;
}) {
  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 18,
        borderTop: "1px solid var(--at-line)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--at-serif)",
          fontSize: 15,
          fontStyle: "var(--at-italic-style, italic)",
          marginBottom: 10,
          color: "var(--at-ink)",
        }}
      >
        {title}
      </div>
      {options.map((opt, idx) => {
        const isSelected = selected === idx;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(idx)}
            className="flex w-full items-center gap-2.5 text-left"
            style={{
              padding: "6px 0",
              fontSize: 13,
              color: "var(--at-ink)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 14,
                height: 14,
                border: "1px solid var(--at-ink)",
                background: isSelected ? "var(--at-terre)" : "transparent",
                flexShrink: 0,
              }}
            />
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function MobileSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--at-line)",
            display: "flex",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              background: "var(--at-sand)",
              flexShrink: 0,
            }}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div style={{ height: 14, background: "var(--at-sand)", width: "80%" }} />
            <div style={{ height: 10, background: "var(--at-sand)", width: "60%" }} />
            <div style={{ height: 12, background: "var(--at-sand)", width: "40%", marginTop: 6 }} />
          </div>
        </div>
      ))}
    </>
  );
}

function MobileError({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div
      style={{
        padding: "32px 20px",
        borderTop: "1px solid var(--at-line)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--at-serif)",
          fontSize: 18,
          fontWeight: 500,
          marginBottom: 8,
        }}
      >
        {labels.errorTitle}
      </div>
      <div style={{ fontSize: 13, color: "var(--at-muted)", marginBottom: 16 }}>
        {message}
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        style={{
          fontFamily: "var(--at-mono)",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "8px 14px",
          background: "var(--at-ink)",
          color: "var(--at-cream)",
          border: "none",
          cursor: "pointer",
          opacity: isRetrying ? 0.6 : 1,
        }}
      >
        {labels.retry}
      </button>
    </div>
  );
}

function MobileEmpty() {
  return (
    <div
      style={{
        padding: "48px 20px",
        borderTop: "1px solid var(--at-line)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--at-serif)",
          fontSize: 20,
          fontWeight: 500,
          marginBottom: 8,
          color: "var(--at-ink)",
        }}
      >
        {labels.empty}
      </div>
      <div style={{ fontSize: 13, color: "var(--at-muted)" }}>
        {labels.emptyDescription}
      </div>
    </div>
  );
}

function MobilePagination({
  page,
  hasPrevious,
  hasNext,
  onPageChange,
}: {
  page: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (p: number) => void;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: "20px",
        borderTop: "1px solid var(--at-line)",
      }}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevious}
        style={{
          fontFamily: "var(--at-mono)",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "8px 14px",
          background: "transparent",
          color: "var(--at-ink)",
          border: "1px solid var(--at-line)",
          opacity: hasPrevious ? 1 : 0.4,
          cursor: hasPrevious ? "pointer" : "not-allowed",
        }}
      >
        ← {labels.prev}
      </button>
      <span
        style={{
          fontFamily: "var(--at-mono)",
          fontSize: 11,
          color: "var(--at-muted)",
          letterSpacing: "0.08em",
        }}
      >
        {page}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        style={{
          fontFamily: "var(--at-mono)",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "8px 14px",
          background: "transparent",
          color: "var(--at-ink)",
          border: "1px solid var(--at-line)",
          opacity: hasNext ? 1 : 0.4,
          cursor: hasNext ? "pointer" : "not-allowed",
        }}
      >
        {labels.next} →
      </button>
    </div>
  );
}

function DesktopSkeleton({ count }: { count: number }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 16 }}>
          <div
            style={{
              width: 160,
              height: 160,
              background: "var(--at-sand)",
              flexShrink: 0,
            }}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div style={{ height: 16, background: "var(--at-sand)", width: "85%" }} />
            <div style={{ height: 12, background: "var(--at-sand)", width: "55%" }} />
            <div style={{ flex: 1 }} />
            <div style={{ height: 14, background: "var(--at-sand)", width: "45%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DesktopError({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div style={{ padding: "64px 0", textAlign: "center" }}>
      <div
        style={{
          fontFamily: "var(--at-serif)",
          fontSize: 24,
          fontWeight: 500,
          marginBottom: 12,
        }}
      >
        {labels.errorTitle}
      </div>
      <div style={{ fontSize: 14, color: "var(--at-muted)", marginBottom: 20 }}>
        {message}
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        style={{
          fontFamily: "var(--at-mono)",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "10px 18px",
          background: "var(--at-ink)",
          color: "var(--at-cream)",
          border: "none",
          cursor: "pointer",
          opacity: isRetrying ? 0.6 : 1,
        }}
      >
        {labels.retry}
      </button>
    </div>
  );
}

function DesktopEmpty() {
  return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <div
        style={{
          fontFamily: "var(--at-serif)",
          fontSize: 28,
          fontWeight: 500,
          fontStyle: "var(--at-italic-style, italic)",
          marginBottom: 10,
          color: "var(--at-ink)",
        }}
      >
        {labels.empty}
      </div>
      <div style={{ fontSize: 14, color: "var(--at-muted)" }}>
        {labels.emptyDescription}
      </div>
    </div>
  );
}

function DesktopPagination({
  page,
  totalPages,
  hasPrevious,
  hasNext,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (p: number) => void;
}) {
  // Build list: 1, 2, 3, …, last (with current always in range).
  const pages: Array<{ key: string; label: string; page?: number }> = [];
  const last = Math.max(totalPages, page);
  const seen = new Set<number>();
  const push = (p: number) => {
    if (seen.has(p)) return;
    seen.add(p);
    pages.push({ key: `p${p}`, label: String(p), page: p });
  };
  push(1);
  if (last >= 2) push(2);
  if (last >= 3) push(3);
  if (page > 4 && page < last - 1) {
    pages.push({ key: "ellipsis-pre", label: "…" });
    push(page);
  }
  if (last >= 4) {
    pages.push({ key: "ellipsis-end", label: "…" });
    push(last);
  }

  return (
    <div
      className="flex items-center justify-center gap-1"
      style={{
        marginTop: 40,
        fontFamily: "var(--at-mono)",
        fontSize: 12,
      }}
    >
      {hasPrevious ? (
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          style={{
            padding: "8px 14px",
            background: "transparent",
            color: "var(--at-ink)",
            border: "1px solid var(--at-line)",
            cursor: "pointer",
          }}
        >
          ←
        </button>
      ) : null}
      {pages.map((p) => {
        const active = p.page === page;
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => p.page && onPageChange(p.page)}
            disabled={!p.page}
            style={{
              padding: "8px 14px",
              background: active ? "var(--at-ink)" : "transparent",
              color: active ? "var(--at-cream)" : "var(--at-ink)",
              border: active ? "none" : "1px solid var(--at-line)",
              cursor: p.page ? "pointer" : "default",
              minWidth: 40,
            }}
          >
            {p.label}
          </button>
        );
      })}
      {hasNext ? (
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          style={{
            padding: "8px 14px",
            background: "transparent",
            color: "var(--at-ink)",
            border: "1px solid var(--at-line)",
            cursor: "pointer",
          }}
        >
          →
        </button>
      ) : null}
    </div>
  );
}
