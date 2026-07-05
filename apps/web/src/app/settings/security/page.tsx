"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AppShell from "@web/components/layout/AppShell";
import { Button, Card, CardContent, Input } from "@web/components/ui";
import { PhoneLinkSection } from "@web/features/profile/components/PhoneLinkSection";
import {
  useChangePassword,
  useCurrentUser,
  useResendVerification,
} from "@web/lib/hooks/useAuth";
import { fetchAuthMethods } from "@web/lib/api/auth-methods";

function VerifiedBadge({ verified, t }: { verified: boolean; t: ReturnType<typeof useTranslations> }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
      ✓ {t("verified")}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
      {t("notVerified")}
    </span>
  );
}

function EmailSection() {
  const t = useTranslations("security.email");
  const { data: currentUser } = useCurrentUser();
  const { data: authMethods } = useQuery({
    queryKey: ["auth-methods"],
    queryFn: fetchAuthMethods,
  });
  const resend = useResendVerification();
  const [feedback, setFeedback] = useState<
    null | { kind: "ok" | "err"; text: string }
  >(null);

  if (!currentUser) return null;

  const email = authMethods?.email ?? null;
  const canUnlink = authMethods?.canUnlinkEmail ?? false;

  function handleResend() {
    setFeedback(null);
    resend.mutate(undefined, {
      onSuccess: () => setFeedback({ kind: "ok", text: t("resendSent") }),
      onError: (err) =>
        setFeedback({
          kind: "err",
          text: err instanceof Error ? err.message : t("resendError"),
        }),
    });
  }

  return (
    <Card className="border border-border/80">
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section")}
          </h2>
          {email ? <VerifiedBadge verified={email.verified} t={t} /> : null}
        </div>

        {email ? (
          <div className="space-y-3">
            <p
              className="text-sm text-foreground"
              data-testid="security-email-value"
            >
              {email.value}
            </p>
            {!email.verified && (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResend}
                  disabled={resend.isPending}
                  data-testid="security-email-resend"
                >
                  {resend.isPending ? t("resending") : t("resend")}
                </Button>
                {feedback && (
                  <span
                    className={
                      feedback.kind === "ok"
                        ? "text-xs text-green-700"
                        : "text-xs text-red-700"
                    }
                  >
                    {feedback.text}
                  </span>
                )}
              </div>
            )}
            {!canUnlink && (
              <p className="text-xs text-muted-foreground">
                {t("unlinkOnlyAuthMethod")}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("notSet")}</p>
        )}
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
  const t = useTranslations("security.password");
  const { data: authMethods } = useQuery({
    queryKey: ["auth-methods"],
    queryFn: fetchAuthMethods,
  });
  const queryClient = useQueryClient();
  const changePassword = useChangePassword();
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasPassword = authMethods?.hasPassword ?? false;

  function handleSave() {
    setError(null);
    setSuccess(false);
    if (newPassword.length < 8) {
      setError(t("tooShort"));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError(t("mismatch"));
      return;
    }
    // Change-password endpoint requires the current password. For OAuth-only
    // users without a password, the API rejects the call — we surface that
    // as a "Not supported yet" message rather than wiring a separate
    // create-password endpoint (out of scope per US-A4 core).
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onError: (err) =>
          setError(err instanceof Error ? err.message : t("genericError")),
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
          setSuccess(true);
          setOpen(false);
          void queryClient.invalidateQueries({ queryKey: ["auth-methods"] });
        },
      },
    );
  }

  return (
    <Card className="border border-border/80">
      <CardContent className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t("section")}
          </h2>
        </div>

        {!hasPassword ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("createHint")}</p>
            <p className="text-xs text-muted-foreground">{t("createNotice")}</p>
          </div>
        ) : !open ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-foreground">{t("setLabel")}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              data-testid="security-password-change-toggle"
            >
              {t("change")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="space-y-1 block">
              <span className="text-sm font-medium text-foreground">
                {t("current")}
              </span>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-sm font-medium text-foreground">
                {t("new")}
              </span>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-sm font-medium text-foreground">
                {t("confirm")}
              </span>
              <Input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                }}
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={changePassword.isPending}
              >
                {changePassword.isPending ? t("saving") : t("change")}
              </Button>
            </div>
          </div>
        )}

        {success && (
          <p className="text-sm text-green-700" data-testid="security-password-success">
            {t("success")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function SecuritySettingsPage() {
  const t = useTranslations("security");

  return (
    <AppShell title={t("title")}>
      <EmailSection />
      <div data-testid="security-phone-section">
        <PhoneLinkSection />
      </div>
      <PasswordSection />
    </AppShell>
  );
}
