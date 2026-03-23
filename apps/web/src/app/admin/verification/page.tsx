"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  SelectLabel,
} from "@web/components/ui";
import { useAdminVerifications, useUpdateAdminVerification } from "@web/lib/hooks/useApi";
import { getAdminKycDocumentUrl } from "@web/lib/api/admin";
import type { AdminVerificationItem } from "@web/lib/api/types";

export default function AdminVerificationPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [rejectUserId, setRejectUserId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, error } = useAdminVerifications({ page, limit });
  const updateMutation = useUpdateAdminVerification();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleApprove = async (user: AdminVerificationItem) => {
    await updateMutation.mutateAsync({ userId: user.id, action: "APPROVE" });
  };

  const handleReject = async (user: AdminVerificationItem) => {
    if (!rejectReason.trim()) return;
    await updateMutation.mutateAsync({
      userId: user.id,
      action: "REJECT",
      reason: rejectReason.trim(),
    });
    setRejectUserId(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Баталгаажуулалт хүлээгдэж байна
          </h2>
          <p className="text-sm text-muted-foreground">
            Нийт {total} хүсэлт
          </p>
        </div>
      </div>

      {error ? (
        <Card className="border border-border/80">
          <CardContent className="p-6 text-sm text-destructive">
            Баталгаажуулалтуудыг ачааллахад алдаа гарлаа.
          </CardContent>
        </Card>
      ) : null}

      <div className="rounded-xl border border-border/80 bg-background">
        <div className="overflow-x-auto">
          <table className="min-w-180 w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Хэрэглэгч</th>
                <th className="px-4 py-3 text-left font-medium">Имэйл</th>
                <th className="px-4 py-3 text-left font-medium">Огноо</th>
                <th className="px-4 py-3 text-left font-medium">Баримт бичиг</th>
                <th className="px-4 py-3 text-right font-medium">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                    Ачааллаж байна...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                    Хүлээгдэж буй баталгаажуулалт байхгүй.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <>
                    <tr key={item.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {`${item.firstName} ${item.lastName}`.trim() || "Хэрэглэгч"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {item.verificationDocumentUrl ? (
                          <a
                            href={getAdminKycDocumentUrl(item.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Харах
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 border-green-300 text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(item)}
                            disabled={updateMutation.isPending}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Зөвшөөрөх
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 border-red-300 text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setRejectUserId(item.id);
                              setRejectReason("");
                            }}
                            disabled={updateMutation.isPending}
                          >
                            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            Татгалзах
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {rejectUserId === item.id ? (
                      <tr key={`${item.id}-reject`} className="bg-red-50/50">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="flex items-end gap-2">
                            <div className="flex flex-1 flex-col gap-1">
                              <SelectLabel htmlFor={`reject-reason-${item.id}`}>
                                Татгалзах шалтгаан
                              </SelectLabel>
                              <Input
                                id={`reject-reason-${item.id}`}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Татгалзах шалтгааныг оруулна уу..."
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(item)}
                              disabled={!rejectReason.trim() || updateMutation.isPending}
                            >
                              Илгээх
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setRejectUserId(null);
                                setRejectReason("");
                              }}
                            >
                              Болих
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </>
                ))
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
