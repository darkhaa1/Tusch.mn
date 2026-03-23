"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, ShieldCheck, ShieldX, UploadCloud } from "lucide-react";
import AppShell from "@web/components/layout/AppShell";
import { Badge, Button, Card, CardContent, Skeleton } from "@web/components/ui";
import { useCurrentUser, useVerificationStatus, useSubmitVerification } from "@web/lib/hooks/useApi";

function VerificationContent() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: verification, isLoading: statusLoading } = useVerificationStatus();
  const submitMutation = useSubmitVerification();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (userLoading || statusLoading) {
    return (
      <AppShell title="Баталгаажуулалт">
        <Skeleton className="h-64 w-full rounded-xl" />
      </AppShell>
    );
  }

  if (!user) {
    router.push("/login?redirect=/dashboard/verification");
    return null;
  }

  const status = verification?.status ?? "NOT_SUBMITTED";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setSubmitError(null);
    try {
      await submitMutation.mutateAsync(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Алдаа гарлаа");
    }
  };

  return (
    <AppShell
      title="Баталгаажуулалт"
      description="Таны биеийн байцаалтын баримт бичгийн баталгаажуулалт"
    >
      <Card className="border border-border/80">
        <CardContent className="p-6">
          {status === "NOT_SUBMITTED" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                  <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-foreground">
                    Яагаад баталгаажуулах хэрэгтэй вэ?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Баталгаажсан үйлчилгээ үзүүлэгчид хэрэглэгчдийн итгэлийг
                    илүү хурдан олж, захиалга авах магадлал өндөр байдаг.
                    Таны профайл дээр баталгаажсан тэмдэг харагдана.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Хүлээн авах баримт бичгүүд:</p>
                <ul className="list-inside list-disc space-y-0.5">
                  <li>Иргэний үнэмлэх (урд болон арын тал)</li>
                  <li>Гадаад паспорт</li>
                  <li>Жолооны үнэмлэх</li>
                </ul>
                <p className="pt-1">Файлын хэмжээ: 5MB-аас бага. Формат: JPG, PNG, PDF.</p>
              </div>

              <div className="flex flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border/70 bg-muted/20 px-6 py-8 text-center transition hover:bg-muted/40"
                >
                  <UploadCloud className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">
                    {selectedFile ? selectedFile.name : "Баримт бичиг сонгох"}
                  </span>
                  {!selectedFile && (
                    <span className="text-xs text-muted-foreground">
                      JPG, PNG эсвэл PDF — 5MB хүртэл
                    </span>
                  )}
                </button>

                {submitError ? (
                  <p className="text-sm text-destructive">{submitError}</p>
                ) : null}

                <Button
                  onClick={handleSubmit}
                  disabled={!selectedFile || submitMutation.isPending}
                  className="w-fit"
                >
                  {submitMutation.isPending ? "Илгээж байна..." : "Баримт бичиг илгээх"}
                </Button>
              </div>
            </div>
          )}

          {status === "PENDING" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                <Clock className="h-8 w-8 text-amber-500" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-foreground">
                  Хүлээгдэж байна
                </h2>
                <p className="text-sm text-muted-foreground">
                  Таны баримт бичиг хүлээн авагдлаа. Админ шалгаж,
                  72 цагийн дотор хариу мэдэгдэл илгээнэ.
                </p>
              </div>
              <Badge variant="outline" className="rounded-full px-3 text-amber-600 border-amber-300 bg-amber-50">
                Хянагдаж байна
              </Badge>
            </div>
          )}

          {status === "VERIFIED" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 className="h-8 w-8 text-green-500" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-foreground">
                  Баталгаажсан
                </h2>
                <p className="text-sm text-muted-foreground">
                  Таны биеийн байцаалт амжилттай баталгаажлаа.
                  {verification?.verifiedAt
                    ? ` (${new Date(verification.verifiedAt).toLocaleDateString()})`
                    : ""}
                </p>
              </div>
              <Badge className="rounded-full bg-green-500 px-3 text-white hover:bg-green-500">
                ✓ Баталгаажсан
              </Badge>
            </div>
          )}

          {status === "REJECTED" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <ShieldX className="h-6 w-6 text-destructive" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-foreground">
                    Баталгаажуулалт татгалзагдлаа
                  </h2>
                  {verification?.rejectedReason ? (
                    <p className="text-sm text-muted-foreground">
                      Шалтгаан: {verification.rejectedReason}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Баримт бичгийг шалгаж чадсангүй. Дахин илгээнэ үү.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border/70 bg-muted/20 px-6 py-8 text-center transition hover:bg-muted/40"
                >
                  <UploadCloud className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">
                    {selectedFile ? selectedFile.name : "Шинэ баримт бичиг сонгох"}
                  </span>
                  {!selectedFile && (
                    <span className="text-xs text-muted-foreground">
                      JPG, PNG эсвэл PDF — 5MB хүртэл
                    </span>
                  )}
                </button>

                {submitError ? (
                  <p className="text-sm text-destructive">{submitError}</p>
                ) : null}

                <Button
                  onClick={handleSubmit}
                  disabled={!selectedFile || submitMutation.isPending}
                  className="w-fit"
                >
                  {submitMutation.isPending ? "Илгээж байна..." : "Дахин илгээх"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

export default function VerificationPage() {
  return (
    <Suspense>
      <VerificationContent />
    </Suspense>
  );
}
