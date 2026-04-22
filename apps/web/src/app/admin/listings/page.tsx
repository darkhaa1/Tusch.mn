"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, CardContent, Input, Select, SelectLabel } from "@web/components/ui";
import {
  useAdminListings,
  useRestoreAdminListing,
  useUpdateAdminListingStatus,
} from "@web/lib/hooks/useApi";
import type { AdminListing, ListingStatus } from "@web/lib/api/types";
import { CATEGORY_LABEL_MAP, CATEGORY_OPTIONS } from "@web/lib/category-ui";
import { cn } from "@web/lib/utils";

const STATUS_LABELS: Record<ListingStatus, string> = {
  ACTIVE: "Идэвхтэй",
  HIDDEN: "Нуусан",
};

const STATUS_VARIANTS: Record<ListingStatus, "success" | "outline"> = {
  ACTIVE: "success",
  HIDDEN: "outline",
};

export default function AdminListingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ListingStatus | "all" | "deleted">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const query = useMemo(
    () => ({
      q: search.trim() || undefined,
      status: statusFilter === "all" || statusFilter === "deleted" ? undefined : statusFilter,
      includeDeleted: statusFilter === "deleted" ? true : undefined,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      page,
      limit,
    }),
    [search, statusFilter, categoryFilter, page, limit]
  );

  const { data, isLoading, error } = useAdminListings(query);
  const updateStatus = useUpdateAdminListingStatus();
  const restoreListing = useRestoreAdminListing();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleStatusChange = async (listing: AdminListing) => {
    const nextStatus = listing.status === "ACTIVE" ? "HIDDEN" : "ACTIVE";
    await updateStatus.mutateAsync({ listingId: listing.id, status: nextStatus });
  };

  const handleRestore = async (listing: AdminListing) => {
    await restoreListing.mutateAsync({ listingId: listing.id });
  };

  return (
    <div className="space-y-4">
      <Card className="border border-border/80">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-2">
            <SelectLabel htmlFor="admin-listings-search">Хайх</SelectLabel>
            <Input
              id="admin-listings-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Тайлбар, байршлаар хайх"
            />
          </div>
          <div className="flex flex-col gap-2 md:w-52">
            <SelectLabel htmlFor="admin-listings-status">Төлөв</SelectLabel>
            <Select
              id="admin-listings-status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as ListingStatus | "all" | "deleted");
                setPage(1);
              }}
            >
              <option value="all">Бүгд</option>
              <option value="ACTIVE">Идэвхтэй</option>
              <option value="HIDDEN">Нуусан</option>
              <option value="deleted">Устгасан</option>
            </Select>
          </div>
          <div className="flex flex-col gap-2 md:w-56">
            <SelectLabel htmlFor="admin-listings-category">Ангилал</SelectLabel>
            <Select
              id="admin-listings-category"
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">Бүгд</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border border-border/80">
          <CardContent className="p-6 text-sm text-destructive">
            Заруудын жагсаалтыг ачааллахад алдаа гарлаа.
          </CardContent>
        </Card>
      ) : null}

      <div className="rounded-xl border border-border/80 bg-background">
        <div className="overflow-x-auto">
          <table className="min-w-215 w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Зар</th>
                <th className="px-4 py-3 text-left font-medium">Үнэ</th>
                <th className="px-4 py-3 text-left font-medium">Байршил</th>
                <th className="px-4 py-3 text-left font-medium">Төлөв</th>
                <th className="px-4 py-3 text-left font-medium">Нийтэлсэн</th>
                <th className="px-4 py-3 text-left font-medium">Огноо</th>
                <th className="px-4 py-3 text-right font-medium">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                    Зарууд ачаалж байна...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                    Зар олдсонгүй.
                  </td>
                </tr>
              ) : (
                items.map((listing) => {
                  const categoryLabel =
                    listing.category && CATEGORY_LABEL_MAP.get(listing.category)
                      ? CATEGORY_LABEL_MAP.get(listing.category)
                      : listing.category || "—";

                  return (
                    <tr
                      key={listing.id}
                      className={cn(
                        "hover:bg-muted/20",
                        listing.deletedAt ? "bg-muted/30 opacity-60" : undefined
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{categoryLabel}</div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">
                          {listing.description || "Тайлбаргүй"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {typeof listing.price === "number"
                          ? `${listing.price.toLocaleString()} ₮`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">{listing.location || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={STATUS_VARIANTS[listing.status]}>
                            {STATUS_LABELS[listing.status]}
                          </Badge>
                          {listing.deletedAt ? <Badge variant="outline">Устгасан</Badge> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {listing.user
                          ? `${listing.user.firstName || ""} ${listing.user.lastName || ""}`.trim() || "Хэрэглэгч"
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {listing.deletedAt ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestore(listing)}
                            disabled={restoreListing.isPending}
                          >
                            Сэргээх
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant={listing.status === "ACTIVE" ? "destructive" : "outline"}
                            onClick={() => handleStatusChange(listing)}
                            disabled={updateStatus.isPending}
                            className={cn(listing.status !== "ACTIVE" && "border-border/80")}
                          >
                            {listing.status === "ACTIVE" ? "Нуух" : "Идэвхжүүлэх"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Нийт: {total} · Хуудас {page} / {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            Өмнөх
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
          >
            Дараах
          </Button>
        </div>
      </div>
    </div>
  );
}
