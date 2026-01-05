'use client';

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ShieldCheck, Phone, Mail } from "lucide-react";

import ProfileTabs from "./components/ProfileTabs";
import { logout } from "../lib/logout";
import AppShell from "../../components/layout/AppShell";
import { Avatar, Badge, Button, Card, CardContent, buttonVariants } from "@repo/ui";
import { cn } from "../lib/utils";
import { useCurrentUser } from "../hooks/useApi";
import { PageHeader } from "../../components/common";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  const name =
    [currentUser?.firstName || (currentUser as any)?.firstname, currentUser?.lastName || (currentUser as any)?.lastname]
      .filter(Boolean)
      .join(" ")
      .trim() || currentUser?.email || "Хэрэглэгч";
  const handleLogout = () => logout(router, queryClient);

  return (
    <AppShell>
      <PageHeader
        title="Миний профиль"
        actions={
          <button onClick={handleLogout} className={cn(buttonVariants({ variant: "destructive" }))}>
            Гарах
          </button>
        }
        className="mb-4"
      />
      <Card className="overflow-hidden border border-border/80">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar src={currentUser?.avatarUrl || (currentUser as any)?.image} alt={name} className="h-20 w-20" />
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Профайл</p>
                <h2 className="text-2xl font-semibold text-foreground">{name}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Phone className="h-4 w-4" /> {currentUser?.phone ? "Утас баталгаатай" : "Утас шалгаагүй"}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Mail className="h-4 w-4" /> {currentUser?.email ? "Имэйл баталгаатай" : "Имэйл шалгаагүй"}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <ShieldCheck className="h-4 w-4" /> ID баталгаажуулалт (тун удахгүй)
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Профайл засах
            </Button>
            <Button variant="default" size="sm" onClick={handleLogout} className="hidden sm:inline-flex">
              Гарах
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-xs uppercase text-muted-foreground">Хариу</p>
            <p className="text-lg font-semibold text-foreground">90%</p>
            <p className="text-xs text-muted-foreground">Дундаж хариу</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-xs uppercase text-muted-foreground">Дуусгасан</p>
            <p className="text-lg font-semibold text-foreground">—</p>
            <p className="text-xs text-muted-foreground">Одоогоор мэдээлэлгүй</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-xs uppercase text-muted-foreground">Профайл</p>
            <p className="text-lg font-semibold text-foreground">—</p>
            <p className="text-xs text-muted-foreground">Сарын туршид</p>
          </CardContent>
        </Card>
      </div>

      <ProfileTabs />
    </AppShell>
  );
}
