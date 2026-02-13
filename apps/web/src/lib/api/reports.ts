import { apiFetch } from "./base";
import type {
  AdminReportsPage,
  Report,
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "./types";

export async function createReport(body: {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
}): Promise<Report> {
  return apiFetch("/reports", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchAdminReports(params?: {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  page?: number;
  limit?: number;
}): Promise<AdminReportsPage> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.targetType) searchParams.set("targetType", params.targetType);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const path = query ? `/admin/reports?${query}` : "/admin/reports";
  return apiFetch(path, { method: "GET" });
}

export async function updateAdminReportStatus(
  reportId: string,
  status: Extract<ReportStatus, "REVIEWED" | "DISMISSED">,
): Promise<Report> {
  return apiFetch(`/admin/reports/${reportId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
