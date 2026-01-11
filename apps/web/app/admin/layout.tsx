"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent, Button } from "@repo/ui";
import { useCurrentUser } from "../hooks/useApi";
import { cn } from "../lib/utils";
import AppShell from "../../components/layout/AppShell";

const navItems = [
  { href: "/admin", label: "Хянах самбар" },
  { href: "/admin/users", label: "Хэрэглэгчид" },
  { href: "/admin/listings", label: "Зарууд" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: currentUser, isLoading } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();

  if (isLoading) {
    return (
      <AppShell title="Админ" description="Модераци ба удирдлага">
        <Card className="border border-border/80">
          <CardContent className="p-6 text-sm text-muted-foreground">Ачааллаж байна...</CardContent>
        </Card>
      </AppShell>
    );
  }

  if (!currentUser) {
    return (
      <AppShell title="Админ" description="Нэвтрээд үргэлжлүүлнэ үү">
        <Card className="border border-border/80">
          <CardContent className="flex flex-col gap-3 p-6">
            <p className="text-sm text-muted-foreground">
              Админ хэсэгт орохын тулд нэвтрэх шаардлагатай.
            </p>
            <Button className="w-fit" onClick={() => router.push("/")}>
              Нэвтрэх
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (!currentUser.isAdmin) {
    return (
      <AppShell title="Админ" description="Хандах эрхгүй">
        <Card className="border border-border/80">
          <CardContent className="flex flex-col gap-3 p-6">
            <p className="text-sm text-muted-foreground">Хандах эрхгүй.</p>
            <Link
              href="/"
              className={cn(
                "text-sm font-medium text-primary hover:underline",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              )}
            >
              Нүүр рүү буцах
            </Link>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Админ" description="Модераци ба удирдлага">
      <div className="grid gap-6 lg:grid-cols-[220px,1fr]">
        <aside className="space-y-2">
          <nav className="flex flex-col gap-2 rounded-xl border border-border/80 bg-background p-3">
            {navItems.map((item) => {
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
                  {item.label}
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
