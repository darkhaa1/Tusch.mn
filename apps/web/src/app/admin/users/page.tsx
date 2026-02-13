"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, CardContent, Input, Select, SelectLabel } from "@web/components/ui";
import {
  useAdminUsers,
  useRestoreAdminUser,
  useUpdateAdminUserStatus,
} from "@web/lib/hooks/useApi";
import type { AdminUser, UserStatus } from "@web/lib/api/types";
import { cn } from "@web/lib/utils";

const STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "????????",
  SUSPENDED: "??? ??????",
};

const STATUS_VARIANTS: Record<UserStatus, "success" | "destructive"> = {
  ACTIVE: "success",
  SUSPENDED: "destructive",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all" | "deleted">("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const query = useMemo(
    () => ({
      q: search.trim() || undefined,
      status: statusFilter === "all" || statusFilter === "deleted" ? undefined : statusFilter,
      includeDeleted: statusFilter === "deleted" ? true : undefined,
      page,
      limit,
    }),
    [search, statusFilter, page, limit]
  );

  const { data, isLoading, error } = useAdminUsers(query);
  const updateStatus = useUpdateAdminUserStatus();
  const restoreUser = useRestoreAdminUser();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleStatusChange = async (user: AdminUser) => {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await updateStatus.mutateAsync({ userId: user.id, status: nextStatus });
  };

  const handleRestore = async (user: AdminUser) => {
    await restoreUser.mutateAsync({ userId: user.id });
  };

  return (
    <div className="space-y-4">
      <Card className="border border-border/80">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-col gap-2">
            <SelectLabel htmlFor="admin-users-search">????</SelectLabel>
            <Input
              id="admin-users-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="???, ???????? ????"
            />
          </div>
          <div className="flex w-full flex-col gap-2 md:w-60">
            <SelectLabel htmlFor="admin-users-status">?????</SelectLabel>
            <Select
              id="admin-users-status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as UserStatus | "all" | "deleted");
                setPage(1);
              }}
            >
              <option value="all">????</option>
              <option value="ACTIVE">????????</option>
              <option value="SUSPENDED">??? ??????</option>
              <option value="deleted">??????????</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border border-border/80">
          <CardContent className="p-6 text-sm text-destructive">
            ????????????? ???????? ?????????? ????? ??????.
          </CardContent>
        </Card>
      ) : null}

      <div className="rounded-xl border border-border/80 bg-background">
        <div className="overflow-x-auto">
          <table className="min-w-190 w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">?????????</th>
                <th className="px-4 py-3 text-left font-medium">?????</th>
                <th className="px-4 py-3 text-left font-medium">????</th>
                <th className="px-4 py-3 text-left font-medium">?????</th>
                <th className="px-4 py-3 text-left font-medium">?????</th>
                <th className="px-4 py-3 text-right font-medium">??????</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                    ???????? ?????...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                    ????????? ?????????.
                  </td>
                </tr>
              ) : (
                items.map((user) => (
                  <tr
                    key={user.id}
                    className={cn(
                      "hover:bg-muted/20",
                      user.deletedAt ? "bg-muted/30 opacity-60" : undefined
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {`${user.firstName || ""} ${user.lastName || ""}`.trim() || "??????"}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {user.isAdmin ? <Badge variant="secondary">?????</Badge> : null}
                        {user.deletedAt ? <Badge variant="outline">??????????</Badge> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">{user.email || "—"}</td>
                    <td className="px-4 py-3">{user.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[user.status]}>
                        {STATUS_LABELS[user.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.deletedAt ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(user)}
                          disabled={restoreUser.isPending}
                        >
                          ???????
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant={user.status === "ACTIVE" ? "destructive" : "outline"}
                          onClick={() => handleStatusChange(user)}
                          disabled={updateStatus.isPending}
                          className={cn(user.status !== "ACTIVE" && "border-border/80")}
                        >
                          {user.status === "ACTIVE" ? "??? ????" : "???????"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          ????: {total} · ?????? {page} / {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            ?????
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
          >
            ??????
          </Button>
        </div>
      </div>
    </div>
  );
}
