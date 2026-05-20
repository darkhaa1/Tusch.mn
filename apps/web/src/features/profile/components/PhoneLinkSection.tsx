"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { formatMongolianPhoneDisplay } from "@repo/shared";
import { Button, Card, CardContent, Input } from "@web/components/ui";
import { useCurrentUser } from "@web/lib/hooks/useApi";
import { phoneUnlinkRequest } from "@web/lib/api/auth";
import { isFirebasePhoneAuthConfigured } from "@web/lib/firebase/client";
import { PhoneSignInForm } from "@web/features/auth/PhoneSignInForm";

export function PhoneLinkSection() {
  const tPhone = useTranslations("auth.phone");
  const tErrors = useTranslations("errors.phone");
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const [showLinkForm, setShowLinkForm] = useState(false);
  const [confirmingUnlink, setConfirmingUnlink] = useState(false);
  const [password, setPassword] = useState("");
  const [unlinkError, setUnlinkError] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState(false);

  const phoneConfigured = isFirebasePhoneAuthConfigured();
  if (!phoneConfigured) return null;
  if (!currentUser) return null;

  const hasPhone = Boolean(currentUser.phone);
  const hasEmailPassword = Boolean(currentUser.email);
  const canUnlink = hasEmailPassword; // Backend also enforces this — UI mirrors it.

  async function handleUnlink() {
    setUnlinkError(null);
    setUnlinking(true);
    try {
      await phoneUnlinkRequest(password || undefined);
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      setConfirmingUnlink(false);
      setPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : tErrors("generic");
      if (/only auth method/i.test(msg)) {
        setUnlinkError(tErrors("cannotUnlink"));
      } else {
        setUnlinkError(msg);
      }
    } finally {
      setUnlinking(false);
    }
  }

  return (
    <Card className="border border-border/80">
      <CardContent className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {tPhone("title")}
          </h2>
        </div>

        {hasPhone && !showLinkForm && !confirmingUnlink && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-foreground">
                  {formatMongolianPhoneDisplay(currentUser.phone ?? "")}
                </div>
                <div className="text-xs text-green-600">
                  ✓ {tPhone("verified")}
                </div>
              </div>
              <Button
                variant="outline"
                disabled={!canUnlink}
                onClick={() => setConfirmingUnlink(true)}
              >
                {tPhone("unlink")}
              </Button>
            </div>
            {!canUnlink && (
              <p className="text-xs text-muted-foreground">
                {tPhone("unlinkUnavailable")}
              </p>
            )}
          </div>
        )}

        {confirmingUnlink && (
          <div className="space-y-3">
            <p className="text-sm text-foreground">
              {tPhone("unlinkConfirm")}
            </p>
            {hasEmailPassword && (
              <label className="block space-y-1">
                <span className="text-sm font-medium text-foreground">
                  {tPhone("unlinkPasswordPrompt")}
                </span>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </label>
            )}
            {unlinkError && (
              <p className="text-sm text-destructive">{unlinkError}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setConfirmingUnlink(false);
                  setPassword("");
                  setUnlinkError(null);
                }}
              >
                ← {tPhone("changePhone")}
              </Button>
              <Button onClick={handleUnlink} disabled={unlinking}>
                {tPhone("unlink")}
              </Button>
            </div>
          </div>
        )}

        {!hasPhone && !showLinkForm && (
          <Button onClick={() => setShowLinkForm(true)}>
            {tPhone("link")}
          </Button>
        )}

        {showLinkForm && (
          <PhoneSignInForm
            mode="link"
            onSuccess={() => {
              setShowLinkForm(false);
            }}
            onCancel={() => setShowLinkForm(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}
