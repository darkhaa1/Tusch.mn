"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import NewListingModal from "../components/NewListingModal";
import ListingCard from "./ListingCard";
import { useListingsPage, useUsers } from "../hooks/useApi";
import { getNumberParam, setSearchParams } from "../lib/query";
import { resolveCategoryLabel } from "./categoryLabels";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const DEFAULT_SORT = "newest";

const normalizeCategory = (value: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

type ListingsSkeletonProps = {
  count: number;
};

function ListingsSkeleton({ count }: ListingsSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="overflow-hidden rounded-lg border bg-white shadow-sm"
        >
          <div className="h-40 w-full animate-pulse bg-gray-200" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-8 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
};

function ErrorState({ message, onRetry, isRetrying }: ErrorStateProps) {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700"
      role="alert"
    >
      <p className="font-medium">Алдаа гарлаа.</p>
      <p className="mt-1 text-xs text-red-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="mt-4 rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-100 disabled:opacity-60"
      >
        Дахин оролдох
      </button>
    </div>
  );
}

type EmptyStateProps = {
  allListingsHref: string;
  onCreateListing?: () => void;
  showCreateListing?: boolean;
};

function EmptyState({ allListingsHref, onCreateListing, showCreateListing }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <h2 className="text-lg font-semibold">Үр дүн олдсонгүй</h2>
      <p className="mt-2 text-sm text-gray-500">
        Сонгосон шүүлтүүрт тохирох зар олдсонгүй.
      </p>
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href={allListingsHref}
          className="rounded border px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
        >
          Бүх заруудыг харах
        </Link>
        {showCreateListing && onCreateListing ? (
          <button
            type="button"
            onClick={onCreateListing}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
          >
            Зар үүсгэх
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const category = normalizeCategory(searchParams.get("category"));
  const page = getNumberParam(searchParams, "page", DEFAULT_PAGE);
  const limit = getNumberParam(searchParams, "limit", DEFAULT_LIMIT);
  const sort = normalizeCategory(searchParams.get("sort")) || DEFAULT_SORT;

  const { data, isLoading, error, refetch, isFetching } = useListingsPage({
    category,
    page,
    limit,
    sort,
  });

  const items = data?.items ?? [];
  const resolvedPage = data?.page ?? page;
  const resolvedLimit = data?.limit ?? limit;
  const totalKnown = typeof data?.total === "number" && data.total >= 0;
  const total = totalKnown ? data.total : 0;
  const totalPages =
    totalKnown && resolvedLimit > 0 ? Math.ceil(total / resolvedLimit) : 0;
  const hasPrevious = resolvedPage > 1;
  const hasNext = totalKnown ? resolvedPage < totalPages : items.length === resolvedLimit;

  const categoryLabel = useMemo(() => resolveCategoryLabel(category), [category]);
  const labelFinal = category ? categoryLabel || category : "";
  const title = category ? `Зарууд - ${labelFinal}` : "Зарууд";
  const showTotal = !isLoading && !error && totalKnown;

  const updatePage = (nextPage: number) => {
    const query = setSearchParams(searchParams, {
      page: nextPage,
      limit,
      category,
      sort,
    });
    router.push(`/listings${query}`);
  };

  const allListingsQuery = setSearchParams(new URLSearchParams(), {
    page: 1,
    limit,
    sort,
  });
  const allListingsHref = `/listings${allListingsQuery}`;

  const errorMessage = error instanceof Error ? error.message : "Гэнэтийн алдаа.";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {category ? (
            <Link
              href={`/listings${setSearchParams(searchParams, {
                page: 1,
                limit,
                sort,
                category: null,
              })}`}
              className="inline-flex items-center text-sm text-blue-600 transition hover:underline"
            >
              Шүүлтүүрийг цуцлах
            </Link>
          ) : null}
        </div>
        {showTotal ? (
          <div className="text-sm text-gray-500">{total} үр дүн</div>
        ) : null}
      </div>

      {isLoading ? (
        <ListingsSkeleton count={limit} />
      ) : error ? (
        <ErrorState message={errorMessage} onRetry={() => refetch()} isRetrying={isFetching} />
      ) : items.length === 0 ? (
        <EmptyState
          allListingsHref={allListingsHref}
          onCreateListing={() => setCreateModalOpen(true)}
          showCreateListing
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {!isLoading && !error ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => updatePage(resolvedPage - 1)}
            disabled={!hasPrevious || isFetching}
            className="rounded border px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Өмнөх
          </button>
          <div className="text-sm text-gray-500">
            Хуудас {resolvedPage}
            {totalKnown && totalPages > 0 ? ` / ${totalPages}` : ""}
          </div>
          <button
            type="button"
            onClick={() => updatePage(resolvedPage + 1)}
            disabled={!hasNext || isFetching}
            className="rounded border px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Дараах
          </button>
        </div>
      ) : null}

      <NewListingModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </div>
  );
}
