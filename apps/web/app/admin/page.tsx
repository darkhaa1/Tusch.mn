"use client";

import { Card, CardContent } from "@repo/ui";
import { useAdminStats } from "../hooks/useApi";

const statLabels = [
  { key: "usersTotal", label: "Нийт хэрэглэгч" },
  { key: "usersSuspended", label: "Түр хаагдсан хэрэглэгч" },
  { key: "listingsTotal", label: "Нийт зар" },
  { key: "listingsHidden", label: "Нуусан зар" },
  { key: "messagesTotal", label: "Мессеж" },
  { key: "reviewsTotal", label: "Сэтгэгдэл" },
] as const;

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminStats();

  if (error) {
    return (
      <Card className="border border-border/80">
        <CardContent className="p-6 text-sm text-destructive">
          Статистик ачааллахад алдаа гарлаа.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {statLabels.map((stat) => (
        <Card key={stat.key} className="border border-border/80">
          <CardContent className="space-y-2 p-6">
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="text-3xl font-semibold text-foreground">
              {isLoading ? "—" : (data?.[stat.key] ?? 0)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
