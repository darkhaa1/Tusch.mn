"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@web/components/ui";
import { useAdminStats } from "@web/lib/hooks/useApi";

type StatKey = "usersTotal" | "usersSuspended" | "listingsTotal" | "listingsHidden" | "messagesTotal" | "reviewsTotal";

const STAT_KEYS: StatKey[] = [
  "usersTotal",
  "usersSuspended",
  "listingsTotal",
  "listingsHidden",
  "messagesTotal",
  "reviewsTotal",
];

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const { data, isLoading, error } = useAdminStats();

  if (error) {
    return (
      <Card className="border border-border/80">
        <CardContent className="p-6 text-sm text-destructive">
          {t("stats.loadError")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {STAT_KEYS.map((key) => (
        <Card key={key} className="border border-border/80">
          <CardContent className="space-y-2 p-6">
            <div className="text-sm text-muted-foreground">{t(`stats.${key}`)}</div>
            <div className="text-3xl font-semibold text-foreground">
              {isLoading ? "—" : (data?.[key] ?? 0)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
