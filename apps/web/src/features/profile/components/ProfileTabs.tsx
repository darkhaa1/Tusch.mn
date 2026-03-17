"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent } from "@web/components/ui";
import type { CurrentUser } from "@web/lib/api/types";
import { OffersReceivedTab } from "@web/features/offers/OffersReceivedTab";
import { OffersSentTab } from "@web/features/offers/OffersSentTab";
import { OffersHistoryTab } from "@web/features/offers/OffersHistoryTab";

type ProfileTabsProps = {
  user: CurrentUser | null | undefined;
};

const placeholderImages = ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"];

export function ProfileTabs({ user }: ProfileTabsProps) {
  const t = useTranslations("offers");
  const searchParams = useSearchParams();
  const allowedTabs = useMemo(
    () => new Set(["overview", "photos", "reviews", "activity", "offers"]),
    [],
  );
  const resolveTab = useCallback(
    (value: string | null) => (value && allowedTabs.has(value) ? value : "overview"),
    [allowedTabs],
  );
  const [activeTab, setActiveTab] = useState(resolveTab(searchParams.get("tab")));

  useEffect(() => {
    setActiveTab(resolveTab(searchParams.get("tab")));
  }, [searchParams, resolveTab]);
  const createdAt = (user as any)?.createdAt ? new Date((user as any).createdAt) : null;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
        <TabsTrigger
          value="overview"
          className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Танилцуулга
        </TabsTrigger>
        <TabsTrigger
          value="photos"
          className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Зургууд
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Сэтгэгдэл
        </TabsTrigger>
        <TabsTrigger
          value="activity"
          className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Идэвх
        </TabsTrigger>
        <TabsTrigger
          value="offers"
          className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          {t("tabs.offers")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="border border-border/80">
            <CardContent className="space-y-2 p-4">
              <p className="text-sm text-muted-foreground">Үнэлгээ / Сэтгэгдэл</p>
              <p className="text-xl font-semibold">—</p>
              <p className="text-sm text-muted-foreground">Одоогоор мэдээлэлгүй</p>
            </CardContent>
          </Card>
          <Card className="border border-border/80">
            <CardContent className="space-y-2 p-4">
              <p className="text-sm text-muted-foreground">Бүртгүүлсэн огноо</p>
              <p className="text-xl font-semibold">
                {createdAt ? createdAt.toISOString().slice(0, 10) : "—"}
              </p>
              <p className="text-sm text-muted-foreground">Нэгдсэн өдөр</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="photos">
        <Card className="border border-border/80">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {placeholderImages.map((src, idx) => (
                <div key={idx} className="aspect-video overflow-hidden rounded-lg bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Photo placeholder" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reviews">
        <Card className="border border-border/80">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Одоогоор сэтгэгдэл алга.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activity">
        <Card className="border border-border/80">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">Миний зарууд</p>
            <p className="text-sm text-muted-foreground">Одоогоор мэдээлэлгүй.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="offers">
        <Card className="border border-border/80">
          <CardContent className="p-4">
            <Tabs defaultValue="received" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="received"
                  className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  {t("tabs.received")}
                </TabsTrigger>
                <TabsTrigger
                  value="sent"
                  className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  {t("tabs.sent")}
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  {t("tabs.history")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="received">
                <OffersReceivedTab />
              </TabsContent>
              <TabsContent value="sent">
                <OffersSentTab />
              </TabsContent>
              <TabsContent value="history">
                <OffersHistoryTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
