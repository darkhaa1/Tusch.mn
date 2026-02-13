"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Button, Card, CardContent, Select, SelectLabel } from "@web/components/ui";
import { useAdminReports, useUpdateAdminReportStatus } from "@web/lib/hooks/useApi";
import type { AdminReport, ReportStatus, ReportTargetType } from "@web/lib/api/types";

const STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: "Pending",
  REVIEWED: "Reviewed",
  DISMISSED: "Dismissed",
};

const REASON_LABELS: Record<AdminReport["reason"], string> = {
  SPAM: "Spam",
  INAPPROPRIATE: "Inappropriate",
  FRAUD: "Fraud",
  OTHER: "Other",
};

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState<ReportTargetType | "all">("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const query = useMemo(
    () => ({
      status: statusFilter === "all" ? undefined : statusFilter,
      targetType: targetTypeFilter === "all" ? undefined : targetTypeFilter,
      page,
      limit,
    }),
    [statusFilter, targetTypeFilter, page, limit]
  );

  const { data, isLoading, error } = useAdminReports(query);
  const updateStatus = useUpdateAdminReportStatus();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const getTargetLink = (report: AdminReport) => {
    if (report.targetType === "LISTING") {
      return `/listings/${report.targetId}`;
    }
    return `/u/${report.targetId}`;
  };

  const getTargetLabel = (report: AdminReport) => {
    if (!report.target) return "Target not found";
    if ("description" in report.target) {
      return report.target.description || report.target.id;
    }
    const fullName =
      `${report.target.firstName || ""} ${report.target.lastName || ""}`.trim();
    return fullName || report.target.email || report.target.id;
  };

  const handleResolve = async (
    reportId: string,
    status: Extract<ReportStatus, "REVIEWED" | "DISMISSED">,
  ) => {
    await updateStatus.mutateAsync({ reportId, status });
  };

  return (
    <div className="space-y-4">
      <Card className="border border-border/80">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between">
          <div className="flex w-full flex-col gap-2 md:w-60">
            <SelectLabel htmlFor="admin-reports-status">Status</SelectLabel>
            <Select
              id="admin-reports-status"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as ReportStatus | "all");
                setPage(1);
              }}
            >
              <option value="all">All</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="DISMISSED">Dismissed</option>
            </Select>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-60">
            <SelectLabel htmlFor="admin-reports-target">Target Type</SelectLabel>
            <Select
              id="admin-reports-target"
              value={targetTypeFilter}
              onChange={(event) => {
                setTargetTypeFilter(event.target.value as ReportTargetType | "all");
                setPage(1);
              }}
            >
              <option value="all">All</option>
              <option value="LISTING">Listing</option>
              <option value="USER">User</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border border-border/80">
          <CardContent className="p-6 text-sm text-destructive">
            Failed to load reports.
          </CardContent>
        </Card>
      ) : null}

      <div className="rounded-xl border border-border/80 bg-background">
        <div className="overflow-x-auto">
          <table className="min-w-240 w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Target</th>
                <th className="px-4 py-3 text-left font-medium">Reason</th>
                <th className="px-4 py-3 text-left font-medium">Reporter</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={7}>
                    No reports found.
                  </td>
                </tr>
              ) : (
                items.map((report) => {
                  const reporterName =
                    `${report.reporter.firstName || ""} ${report.reporter.lastName || ""}`.trim() ||
                    report.reporter.email ||
                    "Unknown";

                  return (
                    <tr key={report.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="w-fit">
                            {report.targetType}
                          </Badge>
                          <Link
                            href={getTargetLink(report)}
                            className="line-clamp-2 text-foreground hover:underline"
                          >
                            {getTargetLabel(report)}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3">{REASON_LABELS[report.reason]}</td>
                      <td className="px-4 py-3">
                        <div>{reporterName}</div>
                        <div className="text-xs text-muted-foreground">{report.reporter.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            report.status === "PENDING"
                              ? "outline"
                              : report.status === "REVIEWED"
                                ? "success"
                                : "destructive"
                          }
                        >
                          {STATUS_LABELS[report.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(report.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="max-w-xs whitespace-pre-wrap break-words">
                          {report.description || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {report.status === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolve(report.id, "REVIEWED")}
                              disabled={updateStatus.isPending}
                            >
                              Review
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleResolve(report.id, "DISMISSED")}
                              disabled={updateStatus.isPending}
                            >
                              Dismiss
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Done</span>
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
          Total: {total} · Page {page} / {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
