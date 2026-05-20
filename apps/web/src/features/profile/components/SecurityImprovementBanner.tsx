"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Button } from "@web/components/ui";
import { fetchAuthMethods } from "@web/lib/api/auth-methods";
import { useCurrentUser } from "@web/lib/hooks/useAuth";

const DISMISS_STORAGE_KEY = "tusch.securityBanner.dismissedAt";
const DISMISS_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

type BannerState = {
  reasonKey:
    | "reasonVerifyEmail"
    | "reasonAddPhone"
    | "reasonAddPassword";
  // Signature bound to the missing state. The outer wrapper uses it as a
  // React `key` so BannerInner remounts (and re-reads localStorage) when
  // the underlying issue changes — a user who verifies email and then
  // regresses to a different missing factor sees the new banner without
  // honouring the previous dismiss.
  signature: string;
};

/**
 * Soft nudge shown on /profile when the account is missing a hardening
 * lever (unverified email, no phone linked, OAuth-only with no password).
 * Dismissible for 7 days per signature; the dismiss is stored in
 * localStorage under a signature-scoped key.
 */
export function SecurityImprovementBanner() {
  const { data: currentUser } = useCurrentUser();
  const { data: authMethods } = useQuery({
    queryKey: ["auth-methods"],
    queryFn: fetchAuthMethods,
    enabled: !!currentUser,
  });

  const state = computeState(authMethods);
  if (!currentUser || !authMethods || !state) return null;

  return <BannerInner key={state.signature} state={state} />;
}

function BannerInner({ state }: { state: BannerState }) {
  const t = useTranslations("security.banner");
  // Lazy init reads localStorage at mount. Safe because the parent only
  // mounts us after `authMethods` resolves on the client — there is no
  // SSR render for this component to mismatch.
  const [dismissed, setDismissed] = useState<boolean>(() =>
    readDismissed(state.signature),
  );

  if (dismissed) return null;

  function handleDismiss() {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          buildKey(state.signature),
          String(Date.now()),
        );
      } catch {
        // Best effort — if storage is full, just hide for the session.
      }
    }
    setDismissed(true);
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between"
      data-testid="security-improvement-banner"
    >
      <div className="flex-1">
        <p className="font-medium">{t("title")}</p>
        <p className="text-xs text-amber-800/80">{t(state.reasonKey)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/settings/security" data-testid="security-banner-cta">
          <Button size="sm" variant="outline">
            {t("cta")}
          </Button>
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={t("dismiss")}
          className="rounded p-1 text-amber-800/70 transition-colors hover:bg-amber-100 hover:text-amber-900"
          data-testid="security-banner-dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function computeState(
  authMethods:
    | {
        email: { value: string; verified: boolean } | null;
        phone: { value: string; verified: boolean } | null;
        hasPassword: boolean;
      }
    | undefined,
): BannerState | null {
  if (!authMethods) return null;
  if (authMethods.email && !authMethods.email.verified) {
    return { reasonKey: "reasonVerifyEmail", signature: "verify-email" };
  }
  if (!authMethods.phone) {
    return { reasonKey: "reasonAddPhone", signature: "add-phone" };
  }
  if (!authMethods.hasPassword) {
    return { reasonKey: "reasonAddPassword", signature: "add-password" };
  }
  return null;
}

function buildKey(signature: string) {
  return `${DISMISS_STORAGE_KEY}:${signature}`;
}

function readDismissed(signature: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(buildKey(signature));
    if (!raw) return false;
    const dismissedAt = Number(raw);
    return (
      Number.isFinite(dismissedAt) &&
      Date.now() - dismissedAt < DISMISS_WINDOW_MS
    );
  } catch {
    return false;
  }
}
