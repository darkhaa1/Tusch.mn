"use client";

import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppShell from "@web/components/layout/AppShell";
import { Card, CardContent } from "@web/components/ui";
import {
  type EmailNotificationKey,
  type EmailNotificationPreferences,
} from "@repo/shared";
import {
  fetchEmailPreferences,
  updateEmailPreferences,
} from "@web/lib/api/email-preferences";

const TOGGLE_KEYS: EmailNotificationKey[] = [
  "newMessage",
  "newOffer",
  "offerAccepted",
  "offerRejected",
  "offerCompleted",
  "newReview",
  "listingFlagged",
];

export default function NotificationsSettingsPage() {
  const t = useTranslations("settings.notifications");
  const tNotif = useTranslations("notif");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["email-preferences"],
    queryFn: fetchEmailPreferences,
  });

  const mutate = useMutation({
    mutationFn: (patch: EmailNotificationPreferences) =>
      updateEmailPreferences(patch),
    onMutate: async (patch) => {
      // Optimistic update — write the new value straight into the query
      // cache so the UI rocker switches without waiting for the server.
      await queryClient.cancelQueries({ queryKey: ["email-preferences"] });
      const previous = queryClient.getQueryData([
        "email-preferences",
      ]) as { preferences: Required<EmailNotificationPreferences> } | undefined;
      if (previous) {
        queryClient.setQueryData(["email-preferences"], {
          preferences: { ...previous.preferences, ...patch },
        });
      }
      return { previous };
    },
    onError: (_err, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["email-preferences"], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["email-preferences"] });
    },
  });

  const preferences = data?.preferences ?? null;

  function toggle(key: EmailNotificationKey, value: boolean) {
    mutate.mutate({ [key]: value });
  }

  return (
    <AppShell title={t("title")}>
      <Card className="border border-border/80">
        <CardContent className="space-y-1 p-4">
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </CardContent>
      </Card>

      <Card className="border border-border/80">
        <CardContent className="divide-y divide-border p-0">
          {isLoading || !preferences ? (
            <p className="p-4 text-sm text-muted-foreground">{t("loading")}</p>
          ) : (
            TOGGLE_KEYS.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3"
              >
                <span className="text-sm text-foreground">{tNotif(key)}</span>
                <input
                  type="checkbox"
                  className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-muted transition-colors checked:bg-primary"
                  checked={preferences[key]}
                  onChange={(e) => toggle(key, e.target.checked)}
                  aria-label={tNotif(key)}
                />
              </label>
            ))
          )}
        </CardContent>
      </Card>

      <p className="px-1 text-xs text-muted-foreground">
        {tNotif("transactionalNotice")}
      </p>
    </AppShell>
  );
}
