"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@web/components/ui";
import { useCurrentUser, useResendVerification } from "@web/lib/hooks/useApi";

/**
 * Soft banner that nudges the user to verify their email. Renders nothing
 * when the account does not have an email, when it is already verified,
 * or when the user is not loaded yet.
 */
export function UnverifiedEmailBanner() {
  const t = useTranslations("auth.banner");
  const { data: currentUser } = useCurrentUser();
  const resend = useResendVerification();
  const [feedback, setFeedback] = useState<
    null | { kind: "sent" | "error"; text: string }
  >(null);

  if (!currentUser?.email || currentUser.emailVerified) return null;

  function handleResend() {
    setFeedback(null);
    resend.mutate(undefined, {
      onSuccess: () => setFeedback({ kind: "sent", text: t("resendSent") }),
      onError: (err) =>
        setFeedback({
          kind: "error",
          text: err instanceof Error ? err.message : t("resendError"),
        }),
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <p className="font-medium">{t("unverifiedEmail")}</p>
        <p className="text-xs text-amber-800/80">{currentUser.email}</p>
      </div>
      <div className="flex items-center gap-2">
        {feedback && (
          <span
            className={
              feedback.kind === "sent"
                ? "text-xs text-green-700"
                : "text-xs text-red-700"
            }
          >
            {feedback.text}
          </span>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleResend}
          disabled={resend.isPending}
        >
          {resend.isPending ? t("resending") : t("resend")}
        </Button>
      </div>
    </div>
  );
}
