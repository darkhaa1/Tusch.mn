"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Offer } from "@web/lib/api/types";
import {
  useCompleteOffer,
  useOffersHistoryAsClient,
  useOffersHistoryAsProvider,
  useOffersStats,
} from "@web/lib/hooks/useApi";
import { OffersList } from "./OffersList";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@web/components/ui";

const DEFAULT_LIMIT = 8;

type ToastVariant = "success" | "error";

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

function HistorySubTab({
  role,
  onComplete,
}: {
  role: "client" | "provider";
  onComplete: (offer: Offer) => void;
}) {
  const t = useTranslations("offers");
  const [page, setPage] = useState(1);

  const clientQuery = useOffersHistoryAsClient({ page, limit: DEFAULT_LIMIT });
  const providerQuery = useOffersHistoryAsProvider({ page, limit: DEFAULT_LIMIT });
  const query = role === "client" ? clientQuery : providerQuery;
  const { data, isLoading, error, refetch } = query;

  const handleComplete = async (offer: Offer) => {
    onComplete(offer);
  };

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
      onComplete={handleComplete}
      emptyTitle={t("history.empty.title")}
      emptyDescription={t("history.empty.description")}
    />
  );
}

export function OffersHistoryTab() {
  const t = useTranslations("offers");
  const [completeTarget, setCompleteTarget] = useState<Offer | null>(null);
  const [clientNote, setClientNote] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<ToastVariant>("success");
  const completeOffer = useCompleteOffer();

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const handleConfirmComplete = async () => {
    if (!completeTarget) return;
    try {
      await completeOffer.mutateAsync({
        offerId: completeTarget.id,
        clientNote: clientNote.trim() || undefined,
      });
      setToastVariant("success");
      setToastMessage(t("history.toast.completed"));
    } catch (err) {
      setToastVariant("error");
      setToastMessage(err instanceof Error ? err.message : t("errors.generic"));
    } finally {
      setCompleteTarget(null);
      setClientNote("");
    }
  };

  return (
    <>
      <StatsBar />

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
        <TabsContent value="as-client">
          <HistorySubTab role="client" onComplete={setCompleteTarget} />
        </TabsContent>
        <TabsContent value="as-provider">
          <HistorySubTab role="provider" onComplete={setCompleteTarget} />
        </TabsContent>
      </Tabs>

      <Dialog
        open={completeTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCompleteTarget(null);
            setClientNote("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("history.complete.title")}</DialogTitle>
            <DialogDescription>{t("history.complete.description")}</DialogDescription>
          </DialogHeader>
          <textarea
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            rows={3}
            placeholder={t("history.complete.notePlaceholder")}
            value={clientNote}
            onChange={(e) => setClientNote(e.target.value)}
          />
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" disabled={completeOffer.isPending}>
                {t("actions.close")}
              </Button>
            </DialogClose>
            <Button onClick={handleConfirmComplete} disabled={completeOffer.isPending}>
              {completeOffer.isPending ? t("actions.processing") : t("history.complete.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toastMessage ? (
        <div
          role="status"
          className={`fixed right-4 top-4 z-50 rounded-lg border px-4 py-2 text-sm shadow ${
            toastVariant === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {toastMessage}
        </div>
      ) : null}
    </>
  );
}

export default OffersHistoryTab;
