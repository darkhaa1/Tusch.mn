"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, Button } from "@web/components/ui";
import AppShell from "@web/components/layout/AppShell";
import { useCurrentUser } from "@web/lib/hooks/useApi";
import { cn } from "@web/lib/utils";

type NavKey = "dashboard" | "users" | "listings" | "reports";

const NAV_ITEMS: { href: string; key: NavKey }[] = [
  { href: "/admin", key: "dashboard" },
  { href: "/admin/users", key: "users" },
  { href: "/admin/listings", key: "listings" },
  { href: "/admin/reports", key: "reports" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const { data: currentUser, isLoading } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();

  if (isLoading) {
    return (
      <AppShell title={t("title")} description={t("description")}>
        <Card className="border border-border/80">
          <CardContent className="p-6 text-sm text-muted-foreground">{t("loading")}</CardContent>
        </Card>
      </AppShell>
    );
  }

  if (!currentUser) {
    return (
      <AppShell title={t("title")} description={t("loginRequired")}>
        <Card className="border border-border/80">
          <CardContent className="flex flex-col gap-3 p-6">
            <p className="text-sm text-muted-foreground">
              {t("loginRequiredMessage")}
            </p>
            <Button className="w-fit" onClick={() => router.push("/")}>
              {t("loginButton")}
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (!currentUser.isAdmin) {
    return (
      <AppShell title={t("title")} description={t("accessDenied")}>
        <Card className="border border-border/80">
          <CardContent className="flex flex-col gap-3 p-6">
            <p className="text-sm text-muted-foreground">{t("accessDeniedMessage")}</p>
            <Link
              href="/"
              className={cn(
                "text-sm font-medium text-primary hover:underline",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              )}
            >
              {t("backHome")}
            </Link>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("title")} description={t("description")}>
      <div className="grid gap-6 lg:grid-cols-[220px,1fr]">
        <aside className="space-y-2">
          <nav className="flex flex-col gap-2 rounded-xl border border-border/80 bg-background p-3">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  )}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </AppShell>
  );
}
