"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppShell from "@web/components/layout/AppShell";
import { Button, Card, CardContent } from "@web/components/ui";
import { useVerifyEmail } from "@web/lib/hooks/useApi";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const { mutate, isPending, isSuccess, isError, error } = useVerifyEmail();
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!token || hasRequested.current) return;
    hasRequested.current = true;
    mutate(token);
  }, [token, mutate]);

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Токен хүчингүй эсвэл хугацаа дууссан байна";

  return (
    <AppShell title="Имэйл баталгаажуулалт">
      <Card className="border border-border/80">
        <CardContent className="space-y-3 p-6 text-sm text-foreground">
          {!token ? (
            <p>Баталгаажуулах токен олдсонгүй.</p>
          ) : isPending ? (
            <p>Имэйлийг баталгаажуулж байна...</p>
          ) : isSuccess ? (
            <div className="space-y-2">
              <p className="text-green-700">
                Имэйл амжилттай баталгаажлаа! Нэвтрэх
              </p>
              <Button asChild size="sm">
                <Link href="/">Нэвтрэх</Link>
              </Button>
            </div>
          ) : isError ? (
            <p className="text-destructive">{errorMessage}</p>
          ) : (
            <p>Имэйлийг баталгаажуулахад бэлэн.</p>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
