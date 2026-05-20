"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  isValidMongolianPhone,
  maskMongolianPhone,
  normalizeMongolianPhone,
} from "@repo/shared";
import { Button, Input } from "@web/components/ui";
import { usePhoneAuth, type PhoneAuthErrorCode } from "@web/lib/hooks/usePhoneAuth";
import { phoneLinkRequest, phoneLogin } from "@web/lib/api/auth";

const RESEND_COOLDOWN_SECONDS = 60;

type Mode = "login" | "link";

interface Props {
  mode: Mode;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function formatLocalDigits(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 8);
  // Group as XX XX XX XX for display.
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

export function PhoneSignInForm({ mode, onSuccess, onCancel }: Props) {
  const tPhone = useTranslations("auth.phone");
  const tErrors = useTranslations("errors.phone");
  const tBack = useTranslations("common");

  const router = useRouter();
  const queryClient = useQueryClient();
  const phoneAuth = usePhoneAuth();

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [localInput, setLocalInput] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Free-form local input → canonical E.164.
  const canSendCode = useMemo(
    () => isValidMongolianPhone(`+976${localInput.replace(/\s/g, "")}`),
    [localInput],
  );

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  function startCooldown() {
    setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setResendSecondsLeft((prev) => {
        if (prev <= 1 && cooldownTimer.current) {
          clearInterval(cooldownTimer.current);
          cooldownTimer.current = null;
        }
        return Math.max(0, prev - 1);
      });
    }, 1000);
  }

  function translateError(code: PhoneAuthErrorCode): string {
    switch (code) {
      case "invalid-phone":
        return tErrors("invalid");
      case "too-many-requests":
        return tErrors("tooManyRequests");
      case "invalid-code":
        return tErrors("invalidCode");
      case "code-expired":
        return tErrors("codeExpired");
      default:
        return tErrors("generic");
    }
  }

  async function handleSendCode() {
    setError(null);
    const e164 = normalizeMongolianPhone(`+976${localInput.replace(/\s/g, "")}`);
    if (!e164) {
      setError(tErrors("invalid"));
      return;
    }
    const res = await phoneAuth.sendCode(e164);
    if (!res.success) {
      setError(translateError(res.code));
      return;
    }
    setNormalizedPhone(e164);
    setStep("code");
    setCode("");
    startCooldown();
  }

  async function handleVerifyCode(submittedCode: string) {
    if (!normalizedPhone) return;
    setError(null);
    setSubmitting(true);
    try {
      const verifyRes = await phoneAuth.verifyCode(submittedCode);
      if (!verifyRes.success) {
        setError(translateError(verifyRes.code));
        return;
      }

      try {
        if (mode === "login") {
          await phoneLogin(verifyRes.idToken, normalizedPhone);
          await queryClient.invalidateQueries({ queryKey: ["current-user"] });
          onSuccess?.();
          router.push("/profile");
        } else {
          await phoneLinkRequest(verifyRes.idToken, normalizedPhone);
          await queryClient.invalidateQueries({ queryKey: ["current-user"] });
          onSuccess?.();
        }
      } catch (apiErr) {
        const msg =
          apiErr instanceof Error ? apiErr.message : tErrors("generic");
        // 409 → translate to a clearer message.
        if (/already/i.test(msg) || /409/.test(msg)) {
          setError(tErrors("alreadyUsed"));
        } else {
          setError(msg);
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleChangeNumber() {
    setStep("phone");
    setCode("");
    setError(null);
    phoneAuth.reset();
  }

  if (!phoneAuth.isReady) {
    return (
      <p className="text-sm text-muted-foreground">
        {tPhone("notConfigured")}
      </p>
    );
  }

  if (step === "phone") {
    return (
      <div className="space-y-3">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-foreground">
            {tPhone("title")}
          </span>
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
            <span className="text-sm text-muted-foreground select-none">
              +976
            </span>
            <Input
              type="tel"
              inputMode="numeric"
              placeholder={tPhone("placeholder")}
              value={localInput}
              onChange={(e) => setLocalInput(formatLocalDigits(e.target.value))}
              className="border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoComplete="tel-national"
            />
          </div>
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div id={phoneAuth.recaptchaContainerId} />
        <Button
          className="w-full justify-center"
          onClick={handleSendCode}
          disabled={!canSendCode || phoneAuth.isSending}
        >
          {phoneAuth.isSending ? tPhone("sending") : tPhone("sendCode")}
        </Button>
        {onCancel && (
          <Button
            variant="ghost"
            className="w-full justify-center text-sm text-muted-foreground"
            onClick={onCancel}
          >
            ← {tBack("back")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {tPhone("enterCode")}
        {normalizedPhone ? ` (${maskMongolianPhone(normalizedPhone)})` : ""}
      </p>
      <Input
        type="text"
        inputMode="numeric"
        maxLength={6}
        placeholder={tPhone("codePlaceholder")}
        value={code}
        onChange={(e) => {
          const next = e.target.value.replace(/\D/g, "").slice(0, 6);
          setCode(next);
          if (next.length === 6 && !submitting) {
            void handleVerifyCode(next);
          }
        }}
        autoFocus
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        className="w-full justify-center"
        onClick={() => handleVerifyCode(code)}
        disabled={code.length !== 6 || submitting || phoneAuth.isVerifying}
      >
        {submitting || phoneAuth.isVerifying
          ? tPhone("verifying")
          : tPhone("verify")}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          className="text-muted-foreground hover:underline"
          onClick={handleChangeNumber}
        >
          {tPhone("changePhone")}
        </button>
        <button
          type="button"
          className="text-primary disabled:text-muted-foreground disabled:no-underline hover:underline"
          onClick={handleSendCode}
          disabled={resendSecondsLeft > 0 || phoneAuth.isSending}
        >
          {resendSecondsLeft > 0
            ? tPhone("resendIn", { seconds: resendSecondsLeft })
            : tPhone("resend")}
        </button>
      </div>
    </div>
  );
}
