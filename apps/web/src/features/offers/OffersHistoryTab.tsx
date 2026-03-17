"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useOffersHistoryAsClient,
  useOffersHistoryAsProvider,
  useOffersStats,
} from "@web/lib/hooks/useApi";
import { OffersList } from "./OffersList";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@web/components/ui";

const DEFAULT_LIMIT = 8;

function StatsBar() {
  const t = useTranslations("offers");
  const { data: stats, isLoading } = useOffersStats();

  if (isLoading || !stats) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
      <div className="rounded-lg border border-border/80 bg-muted/20 px-4 py-3 text-center">
        <p className="text-2xl font-semibold text-foreground">{stats.totalCompleted}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t("history.stats.totalCompleted")}</p>
      </div>
      <div className="rounded-lg border border-border/80 bg-muted/20 px-4 py-3 text-center">
        <p className="text-2xl font-semibold text-foreground">
          {(stats.totalSpentAsClient ?? 0).toLocaleString()} ₮
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{t("history.stats.totalSpent")}</p>
      </div>
      <div className="rounded-lg border border-border/80 bg-muted/20 px-4 py-3 text-center">
        <p className="text-2xl font-semibold text-foreground">
          {(stats.totalEarnedAsProvider ?? 0).toLocaleString()} ₮
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{t("history.stats.totalEarned")}</p>
      </div>
      <div className="rounded-lg border border-border/80 bg-muted/20 px-4 py-3 text-center">
        <p className="text-2xl font-semibold text-foreground">
          {stats.averagePriceAsClient != null
            ? `${stats.averagePriceAsClient.toLocaleString()} ₮`
            : "—"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{t("history.stats.avgPrice")}</p>
      </div>
    </div>
  );
}

function HistorySubTab({ role }: { role: "client" | "provider" }) {
  const t = useTranslations("offers");
  const [page, setPage] = useState(1);

  const clientQuery = useOffersHistoryAsClient({ page, limit: DEFAULT_LIMIT });
  const providerQuery = useOffersHistoryAsProvider({ page, limit: DEFAULT_LIMIT });
  const query = role === "client" ? clientQuery : providerQuery;
  const { data, isLoading, error, refetch } = query;

  return (
    <OffersList
      items={data?.items ?? []}
      isLoading={isLoading}
      error={error}
      page={data?.page ?? page}
      total={data?.total ?? 0}
      limit={data?.limit ?? DEFAULT_LIMIT}
      onPageChange={setPage}
      onRetry={() => refetch()}
      showListing
      showProvider={role === "client"}
      emptyTitle={t("history.empty.title")}
      emptyDescription={t("history.empty.description")}
    />
  );
}

export function OffersHistoryTab() {
  const t = useTranslations("offers");

  return (
    <Tabs defaultValue="as-client" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="as-client"
          className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          {t("history.tabs.asClient")}
        </TabsTrigger>
        <TabsTrigger
          value="as-provider"
          className="w-full transition hover:bg-muted data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          {t("history.tabs.asProvider")}
        </TabsTrigger>
      </TabsList>

      <StatsBar />

      <TabsContent value="as-client">
        <HistorySubTab role="client" />
      </TabsContent>
      <TabsContent value="as-provider">
        <HistorySubTab role="provider" />
      </TabsContent>
    </Tabs>
  );
}

export default OffersHistoryTab;
